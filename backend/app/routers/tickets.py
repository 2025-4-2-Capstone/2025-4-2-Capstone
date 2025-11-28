from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from typing import Literal

import app.models as models
from app.database import get_db
from app.routers.auth import get_current_user
from app.utils.audit import write_audit_log

router = APIRouter(tags=["Tickets"])

# -----------------------------
# 📌 Ticket Create Schema
# -----------------------------
class TicketCreate(BaseModel):
    title: str
    description: str
    priority: Literal["low", "normal", "high", "urgent"]
    assigned_to: Optional[int] = None
    department_id: Optional[int] = None  # ← 자동 배정 고려해서 포함


# -----------------------------
# 📌 Ticket Update Schema
# -----------------------------
class TicketUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None

    class Config:
        from_attributes = True


# -----------------------------
# 📌 Ticket Response Schema
# -----------------------------
class TicketResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    priority: str
    status: str
    created_by: int
    assigned_to: Optional[int]
    sla_policy_id: Optional[int]
    department_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True


# -----------------------------
# 📌 부서별 티켓 부하 조회
# -----------------------------
def get_department_load(db: Session):
    return dict(
        db.query(models.Ticket.department_id, func.count(models.Ticket.id))
        .filter(models.Ticket.status.in_(["open", "in_progress"]))
        .group_by(models.Ticket.department_id)
        .all()
    )


DEPARTMENT_OVERLOAD_THRESHOLD = 10  # 과부하 기준


# -----------------------------
# 📌 자동 부서 선택
# -----------------------------
def auto_assign_department(db: Session) -> Optional[int]:
    department_load = get_department_load(db)

    # 모든 부서 목록
    all_departments = [
        d.department_id
        for d in db.query(models.User.department_id).distinct().all()
    ]

    candidate_departments = []
    for dept in all_departments:
        load = department_load.get(dept, 0)
        if load < DEPARTMENT_OVERLOAD_THRESHOLD:
            candidate_departments.append((dept, load))

    if not candidate_departments:
        return None

    candidate_departments.sort(key=lambda x: x[1])
    return candidate_departments[0][0]


# -----------------------------
# 📌 자동 엔지니어 선택
# -----------------------------
def auto_assign_user(db: Session, department_id: int) -> Optional[int]:
    engineers = db.query(models.User).filter(
        models.User.department_id == department_id
    ).all()

    if not engineers:
        return None

    engineer_load = []
    for eng in engineers:
        count = (
            db.query(func.count(models.Ticket.id))
            .filter(
                models.Ticket.assigned_to == eng.id,
                models.Ticket.status.in_(["open", "in_progress"])
            )
            .scalar()
        )
        engineer_load.append((eng.id, count))

    engineer_load.sort(key=lambda x: x[1])
    return engineer_load[0][0]


# -----------------------------
# 📌 Create Ticket
# -----------------------------
@router.post("/tickets", response_model=TicketResponse)
def create_ticket(
    ticket: TicketCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    # SLA 정책 찾기
    sla_policy = (
        db.query(models.SlaPolicy)
        .filter(models.SlaPolicy.priority == ticket.priority)
        .first()
    )

    if not sla_policy:
        raise HTTPException(
            status_code=400,
            detail="해당 우선순위의 SLA 정책이 존재하지 않습니다."
        )

    # ① 부서 자동배정
    assigned_department = ticket.department_id or auto_assign_department(db)
    if assigned_department is None:
        assigned_department = current_user.department_id  # fallback

    # ② 엔지니어 자동배정
    assigned_user = ticket.assigned_to or auto_assign_user(db, assigned_department)

    # 티켓 생성
    new_ticket = models.Ticket(
        title=ticket.title,
        description=ticket.description,
        priority=ticket.priority,
        status="open",
        created_by=current_user.id,
        assigned_to=assigned_user,
        sla_policy_id=sla_policy.id,
        department_id=assigned_department,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    # 감사 로그
    write_audit_log(
        db=db,
        user_id=current_user.id,
        action="create",
        target_table="tickets",
        target_id=new_ticket.id,
        details=f"title={new_ticket.title}, priority={new_ticket.priority}",
        request=request
    )

    return new_ticket

# -----------------------------
# 📌 Get All Tickets
# -----------------------------
@router.get("/tickets", response_model=List[TicketResponse])
def get_all_tickets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    role = current_user.role.name

    # super_admin → 전체 조회
    if role == "super_admin":
        return db.query(models.Ticket).all()

    # admin/manager → 같은 부서만 조회
    elif role in ["admin", "manager"]:
        return (
            db.query(models.Ticket)
            .filter(models.Ticket.department_id == current_user.department_id)
            .all()
        )

    # 일반 사용자 → 본인이 생성한 티켓만 조회
    else:
        return (
            db.query(models.Ticket)
            .filter(models.Ticket.created_by == current_user.id)
            .all()
        )


# -----------------------------
# 📌 Get Single Ticket
# -----------------------------
@router.get("/tickets/{ticket_id}", response_model=TicketResponse)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    ticket = db.query(models.Ticket).filter(
        models.Ticket.id == ticket_id
    ).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="티켓을 찾을 수 없습니다.")

    role = current_user.role.name

    # super_admin → 전체 접근 가능
    if role != "super_admin":

        # admin, manager → 부서 동일해야 조회 가능
        if role in ["admin", "manager"]:
            if ticket.department_id != current_user.department_id:
                raise HTTPException(
                    status_code=403,
                    detail="다른 부서의 티켓입니다."
                )

        # 일반 유저 → 자신이 만든 티켓만 조회 가능
        else:
            if ticket.created_by != current_user.id:
                raise HTTPException(
                    status_code=403,
                    detail="본인 티켓만 조회 가능"
                )

    return ticket


# -----------------------------
# 📌 Update Ticket
# -----------------------------
@router.put("/tickets/{ticket_id}", response_model=TicketResponse)
def update_ticket(
    ticket_id: int,
    data: TicketUpdateRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    ticket = db.query(models.Ticket).filter(
        models.Ticket.id == ticket_id
    ).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="티켓을 찾을 수 없습니다.")

    role = current_user.role.name

    # super_admin → 전체 수정 가능
    if role in ["super_admin", "admin"]:
        pass

    # manager → 같은 부서 티켓만 수정 가능
    elif role == "manager":
        if ticket.department_id != current_user.department_id:
            raise HTTPException(
                status_code=403,
                detail="부서장: 해당 부서만 수정 가능"
            )

    # 일반 사용자: 본인 티켓만 수정 가능
    elif role in ["engineer", "staff", "user"]:
        if ticket.created_by != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="본인 티켓만 수정 가능"
            )

    else:
        raise HTTPException(status_code=403, detail="권한 없음")

    # -----------------------------
    # 실제 수정 작업
    # -----------------------------
    updated = {}

    if data.title:
        ticket.title = data.title
        updated["title"] = data.title

    if data.description:
        ticket.description = data.description
        updated["description"] = data.description

    if data.priority:
        ticket.priority = data.priority
        updated["priority"] = data.priority

    if data.status:
        ticket.status = data.status
        updated["status"] = data.status

    if not updated:
        raise HTTPException(
            status_code=400,
            detail="수정할 데이터가 없습니다."
        )

    ticket.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(ticket)

    # 감사 로그
    write_audit_log(
        db=db,
        user_id=current_user.id,
        action="update",
        target_table="tickets",
        target_id=ticket.id,
        details=str(updated),
        request=request
    )

    return ticket
