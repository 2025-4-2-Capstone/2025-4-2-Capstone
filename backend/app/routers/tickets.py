from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from typing import Literal
from app.utils.audit import write_audit_log
import app.models as models
from app.database import get_db
from app.routers.auth import get_current_user

router = APIRouter(tags=["Tickets"])

# -----------------------------
# 📌 Ticket Create Schema
# -----------------------------
class TicketCreate(BaseModel):
    title: str
    description: str
    priority: Literal["low", "normal", "high", "urgent"]
    assigned_to: Optional[int] = None


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
    updated_at: Optional[datetime] = None   # ← 여기 수정!

    class Config:
        orm_mode = True



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

    sla_policy = (
        db.query(models.SlaPolicy)
        .filter(models.SlaPolicy.priority == ticket.priority)
        .first()
    )
    if not sla_policy:
        raise HTTPException(status_code=400, detail="해당 우선순위의 SLA 정책이 존재하지 않습니다.")

    new_ticket = models.Ticket(
        title=ticket.title,
        description=ticket.description,
        priority=ticket.priority,
        status="open",
        created_by=current_user.id,
        assigned_to=ticket.assigned_to,
        sla_policy_id=sla_policy.id,
        department_id=current_user.department_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
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

    if role == "super_admin":
        return db.query(models.Ticket).all()

    elif role in ["admin", "manager"]:
        return (
            db.query(models.Ticket)
            .filter(models.Ticket.department_id == current_user.department_id)
            .all()
        )

    else:
        return (
            db.query(models.Ticket)
            .filter(models.Ticket.created_by == current_user.id)
            .all()
        )


# -----------------------------
# 📌 Get Single Ticket (FIXED)
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

    # super_admin → 모든 티켓 OK
    if role != "super_admin":

        # 관리자 계열 → 같은 부서만
        if role in ["admin", "manager"]:
            if ticket.department_id != current_user.department_id:
                raise HTTPException(status_code=403, detail="다른 부서의 티켓입니다.")

        # 일반 유저 → 본인 티켓만
        else:
            if ticket.created_by != current_user.id:
                raise HTTPException(status_code=403, detail="본인 티켓만 조회 가능")

    return ticket


# -----------------------------
# 📌 Update Ticket
# -----------------------------
@router.put("/tickets/{ticket_id}")
def update_ticket(
    ticket_id: int,
    data: TicketUpdateRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="티켓을 찾을 수 없습니다.")

    role = current_user.role.name

    # 권한 체크
    if role in ["super_admin", "admin"]:
        pass
    elif role == "manager":
        if ticket.department_id != current_user.department_id:
            raise HTTPException(status_code=403, detail="부서장: 해당 부서만 수정 가능")
    elif role in ["engineer", "staff", "user"]:
        if ticket.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="본인 티켓만 수정 가능")
    else:
        raise HTTPException(status_code=403, detail="권한 없음")

    # 수정
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
        raise HTTPException(status_code=400, detail="수정할 데이터가 없습니다.")

    ticket.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(ticket)

    write_audit_log(
        db=db,
        user_id=current_user.id,
        action="update",
        target_table="tickets",
        target_id=ticket.id,
        details=str(updated),
        request=request
    )

    return {"msg": "티켓 수정 완료", "ticket": ticket}
