from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

from app.utils.audit import write_audit_log
import app.models as models
from app.database import get_db
from app.routers.auth import get_current_user


router = APIRouter(tags=["Tickets"])


# -----------------------------
# 📌 Ticket Create Model
# -----------------------------
class TicketCreate(BaseModel):
    title: str
    description: str
    priority: str
    assigned_to: Optional[int] = None
    sla_policy_id: Optional[int] = None


# -----------------------------
# 📌 Ticket Update Model
# -----------------------------
class TicketUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None

    class Config:
        from_attributes = True


# -----------------------------
# 📌 Ticket Response Model
# -----------------------------
class TicketResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: str
    priority: Optional[str]
    created_by: int
    assigned_to: Optional[int]
    sla_policy_id: int
    department_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# -----------------------------
# 📌 Create Ticket
# -----------------------------
@router.post("/tickets", response_model=TicketResponse)
def create_ticket(
    ticket: TicketCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # ⭐ priority를 통해 SLA 자동 선택
    sla_policy = db.query(models.SLAPolicy)\
                   .filter(models.SLAPolicy.priority == ticket.priority)\
                   .first()

    new_ticket = models.Ticket(
        title=ticket.title,
        description=ticket.description,
        priority=ticket.priority,
        status="open",
        created_by=current_user.id,
        assigned_to=ticket.assigned_to,
        sla_policy_id=sla_policy.id if sla_policy else None,
        department_id=current_user.department_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    write_audit_log(
        db=db,
        user_id=current_user.id,
        action="create",
        target_table="tickets",
        target_id=new_ticket.id,
        details=f"title={new_ticket.title}, priority={new_ticket.priority}"
    )

    return new_ticket



# -----------------------------
# 📌 Get All Tickets
# -----------------------------
@router.get("/tickets")
def get_all_tickets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        role = current_user.role.name

        if role == "super_admin":
            tickets = db.query(models.Ticket).all()

        elif role in ["admin", "manager"]:
            tickets = (
                db.query(models.Ticket)
                .filter(models.Ticket.department_id == current_user.department_id)
                .all()
            )

        else:
            tickets = (
                db.query(models.Ticket)
                .filter(models.Ticket.created_by == current_user.id)
                .all()
            )

        return tickets

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------
# 📌 Get Single Ticket
# -----------------------------
@router.get("/tickets/{ticket_id}", response_model=TicketResponse)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="티켓을 찾을 수 없습니다.")

    role = current_user.role.name

    # super_admin 전체 접근 가능
    if role != "super_admin":

        # admin / manager → 자기 부서 티켓만 조회
        if role in ["admin", "manager"]:
            if ticket.department_id != current_user.department_id:
                raise HTTPException(status_code=403, detail="다른 부서의 티켓입니다.")

        # 일반 사용자 → 자기 티켓만 조회
        else:
            if ticket.created_by != current_user.id:
                raise HTTPException(status_code=403, detail="본인 티켓만 조회할 수 있습니다.")

    return ticket


# -----------------------------
# 📌 Update Ticket (역할 기반 권한)
# -----------------------------
@router.put("/tickets/{ticket_id}")
def update_ticket(
    ticket_id: int,
    data: TicketUpdateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="티켓을 찾을 수 없습니다.")

    role = current_user.role.name
    user_dept = current_user.department_id
    ticket_dept = ticket.department_id

    # -----------------------------
    # 📌 역할 기반 수정 권한
    # -----------------------------
    # super_admin / admin → 전체 수정 가능
    if role in ["super_admin", "admin"]:
        pass

    # manager → 자기 부서 전체 티켓 수정 가능
    elif role == "manager":
        if user_dept != ticket_dept:
            raise HTTPException(status_code=403, detail="부서장: 해당 부서 티켓만 수정 가능.")

    # staff / engineer / user → 자기 티켓만 수정
    elif role in ["engineer", "staff", "user"]:
        if ticket.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="본인 티켓만 수정 가능합니다.")

    else:
        raise HTTPException(status_code=403, detail="권한이 없습니다.")

    # -----------------------------
    # 📌 실제 수정 적용
    # -----------------------------
    updated = False

    if data.title is not None:
        ticket.title = data.title
        updated = True

    if data.description is not None:
        ticket.description = data.description
        updated = True

    if data.priority is not None:
        ticket.priority = data.priority
        updated = True

    if data.status is not None:
        ticket.status = data.status
        updated = True

    if not updated:
        raise HTTPException(status_code=400, detail="수정할 데이터가 없습니다.")

    ticket.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(ticket)

    # 감사 로그 기록
    write_audit_log(
        db=db,
        user_id=current_user.id,
        action="update",
        target_table="tickets",
        target_id=ticket.id,
        details=f"updated fields: {data.model_dump(exclude_none=True)}"
    )

    return {"msg": "티켓이 성공적으로 수정되었습니다.", "ticket": ticket}
