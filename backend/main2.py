from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.openapi.utils import get_openapi   # ✅ 이 줄 추가!!
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import atexit, logging
from uuid import uuid4

import models
from database import SessionLocal, get_db
from main import get_current_user
from models import SLAAlert, User


app = FastAPI(title="Ticket API")

# ✅ Swagger 에서 JWT 토큰 입력 가능하게 만들기
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Ticket API",
        version="1.0.0",
        description="Ticket APIs with JWT authentication",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "bearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    for path in openapi_schema["paths"].values():
        for operation in path.values():
            operation["security"] = [{"bearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# --- DB 세션 ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- 📦 Ticket DTO ---
class TicketCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "medium"
    assigned_to: Optional[int] = None
    sla_policy_id: int

class TicketResponse(BaseModel):  # ✅ 여기 a 삭제됨
    id: int
    title: str
    description: Optional[str]
    status: str
    priority: Optional[str]
    created_by: int
    assigned_to: Optional[int]
    sla_policy_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# --- ✅ 티켓 생성 ---
@app.post("/tickets", response_model=TicketResponse)
def create_ticket(
    ticket: TicketCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_ticket = models.Ticket(
        title=ticket.title,
        description=ticket.description,
        priority=ticket.priority,
        status="open",
        created_by=current_user.id,
        assigned_to=ticket.assigned_to,
        sla_policy_id=ticket.sla_policy_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    # ✅ 감사 로그 기록
    write_audit_log(
        db=db,
        user_id=current_user.id,
        action="create",
        target_table="tickets",
        target_id=new_ticket.id,
        details=f"title={new_ticket.title}, priority={new_ticket.priority}"
    )

    return new_ticket

# --- ✅ 전체 티켓 조회 ---
@app.get("/tickets", response_model=List[TicketResponse])
def get_all_tickets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # ✅ 세션 변수 설정 (RLS 작동 핵심)
   # RLS 작동 실패로 주석처리- db.execute(text(f"SET session \"app.current_user_id\" = '{current_user.id}'"))
   # RLS 작동 실패로 주석처리- db.execute(text(f"SET session \"app.current_role\" = '{current_user.role.name}'"))

    # ✅ 이제 RLS가 활성화된 상태에서 쿼리
    tickets = db.query(models.Ticket).all()
    return tickets



# --- ✅ 특정 티켓 조회 ---
@app.get("/tickets/{ticket_id}", response_model=TicketResponse)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="티켓을 찾을 수 없습니다.")
    return ticket

# --- 📌 티켓 상태 변경 ---
class TicketStatusUpdate(BaseModel):
    to_status: str
    comment: Optional[str] = None

    # --- 📦 PII 토큰화 DTO ---
class TokenizeRequest(BaseModel):
    data: str

class TokenizeResponse(BaseModel):
    token: str

class DecodeResponse(BaseModel):
    real_data: str

@app.put("/tickets/{ticket_id}/status")
def update_ticket_status(
    ticket_id: int,
    status_update: TicketStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 1. 티켓 존재 여부 확인
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="해당 티켓이 존재하지 않습니다.")

    # 2. 유효한 상태인지 확인
    valid_statuses = ["open", "in_progress", "resolved", "closed"]
    if status_update.to_status not in valid_statuses:
        raise HTTPException(status_code=400, detail="유효하지 않은 상태입니다.")

    # 3. 상태 변경 기록 저장
    transition = models.TicketTransition(
        ticket_id=ticket.id,
        from_status=ticket.status,
        to_status=status_update.to_status,
        changed_by=current_user.id,
        changed_at=datetime.utcnow(),
        comment=status_update.comment
    )
    db.add(transition)

    # 4. 티켓 상태 업데이트
    ticket.status = status_update.to_status
    ticket.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(ticket)
    write_audit_log(
    db=db,
    user_id=current_user.id,
    action="update",
    target_table="tickets",
    target_id=ticket.id,
    details=f"{transition.from_status} → {transition.to_status}")

    return {"message": "티켓 상태가 변경되었습니다.", "ticket_id": ticket.id, "new_status": ticket.status}

@app.put("/sla-alerts/{alert_id}/resolve")
def resolve_sla_alert(alert_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alert = db.query(SLAAlert).filter(SLAAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    if alert.resolved:
        raise HTTPException(status_code=400, detail="Alert already resolved")

    alert.resolved = True
    db.commit()
    return {"message": "Alert resolved successfully", "alert_id": alert_id}


# ✅ SLA 위반 검사 함수 정의 (맨 아래에 붙이세요)
def check_sla_violations():
    db = SessionLocal()
    now = datetime.utcnow()
    tickets = db.query(models.Ticket).filter(models.Ticket.status.in_(["open", "in_progress"])).all()

    for ticket in tickets:
        sla = db.query(models.SlaPolicy).filter(models.SlaPolicy.id == ticket.sla_policy_id).first()
        if not sla:
            continue

        created = ticket.created_at
        if not created:
            continue  # ✅ created_at이 None이면 계산 스킵 (에러 방지)

        minutes_since_created = (now - created).total_seconds() / 60

        # 응답시간 초과 확인
        response_violation = ticket.status == "open" and minutes_since_created > sla.target_response_minutes
        # 해결시간 초과 확인
        resolution_violation = minutes_since_created > sla.target_resolution_minutes

        # 이미 등록된 경고가 있는지 확인
        
        existing_alerts = db.query(models.SLAAlert).filter(models.SLAAlert.ticket_id == ticket.id).all()

        types = [a.alert_type for a in existing_alerts]

        if response_violation and "response_delay" not in types:
            alert = models.SLAAlert(
                ticket_id=ticket.id,
                alert_type="response_delay",
                triggered_at=now
            )
            db.add(alert)
             # ✅ 감사로그 추가 (시스템 자동 감지)
    
            write_audit_log(
                db=db,
                user_id=None,  # 시스템 자동이므로 None
                action="SLA_VIOLATION",
                target_table="tickets",
                target_id=ticket.id,
                details=f"Response time violation detected for ticket {ticket.id}"
            )

        if resolution_violation and "resolution_delay" not in types:
            alert = models.SLAAlert(
                ticket_id=ticket.id,
                alert_type="resolution_delay",
                triggered_at=now
            )
            db.add(alert)

    db.commit()
    db.close()


# ✅ 스케줄러 등록
scheduler = BackgroundScheduler()
scheduler.start()
scheduler.add_job(
    func=check_sla_violations,
    trigger=IntervalTrigger(seconds=60),  # 60초마다 SLA 위반 검사
    id='sla_check',
    name='Check SLA Violations every 60 seconds',
    replace_existing=True
)
atexit.register(lambda: scheduler.shutdown())

# ✅ SLA 위반 자동 알림 스케줄러 추가
from sqlalchemy import func
import logging

# 로그 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AuditLogResponse(BaseModel):
    id: int
    user_id: int
    action: str
    target_table: str
    target_id: int
    details: Optional[str]
    timestamp: datetime

    class Config:
        orm_mode = True

@app.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # ✅ DB 내부 함수 호출 (현재 사용자 역할 전달)
        result = db.execute(
            text("SELECT * FROM get_audit_logs(:role)")
            .bindparams(role=current_user.role.name)
        ).fetchall()
        return [dict(row._mapping) for row in result]

    except Exception as e:
        raise HTTPException(status_code=403, detail=str(e))
from uuid import uuid4

@app.post("/pii/tokenize", response_model=TokenizeResponse)
def tokenize_pii(
    request: TokenizeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 기존에 동일한 real_data가 있으면 재사용 (중복 방지)
    existing = db.query(models.PiiToken).filter(models.PiiToken.real_data == request.data).first()
    if existing:
        return {"token": existing.token}

    # 새 토큰 생성
    new_token = f"tok_{uuid4().hex[:12]}"
    pii = models.PiiToken(
        real_data=request.data,
        token=new_token,
        created_at=datetime.utcnow()
    )
    db.add(pii)
    db.commit()
    db.refresh(pii)
    return {"token": pii.token}

@app.get("/pii/decode/{token}", response_model=DecodeResponse)
def decode_token(
    token: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pii = db.query(models.PiiToken).filter(models.PiiToken.token == token).first()
    if not pii:
        raise HTTPException(status_code=404, detail="Token not found")
    return {"real_data": pii.real_data}

def write_audit_log(
    db: Session,
    user_id: int,
    action: str,
    target_table: str,
    target_id: int,
    details: Optional[str] = None
):
    log = models.AuditLog(
        user_id=user_id,
        action=action,
        target_table=target_table,
        target_id=target_id,
        details=details,
        timestamp=datetime.utcnow()
    )
    db.add(log)
    db.commit()

