from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, Literal, List
from datetime import datetime
from pydantic import BaseModel

from app.database import get_db
from app.routers.auth import get_current_user
from app.models import Ticket, User
from app.utils.audit import write_audit_log   # ⭕

router = APIRouter(prefix="/tickets", tags=["Tickets"])


class TicketCreate(BaseModel):
    title: str
    description: str
    priority: Literal["low", "normal", "high", "urgent"]
    assigned_to: Optional[int] = None
    department_id: Optional[int] = None


def get_department_load(db: Session):
    return dict(
        db.query(Ticket.department_id, func.count(Ticket.id))
        .filter(Ticket.status.in_(["open", "in_progress"]))
        .group_by(Ticket.department_id)
        .all()
    )


DEPARTMENT_OVERLOAD_THRESHOLD = 10


def auto_assign_department(db: Session) -> Optional[int]:
    department_load = get_department_load(db)
    all_departments = [d.id for d in db.query(User.department_id).distinct()]

    candidate_departments = [
        (dept, department_load.get(dept, 0))
        for dept in all_departments
        if department_load.get(dept, 0) < DEPARTMENT_OVERLOAD_THRESHOLD
    ]

    if not candidate_departments:
        return None

    candidate_departments.sort(key=lambda x: x[1])
    return candidate_departments[0][0]


def auto_assign_user(db: Session, department_id: int) -> Optional[int]:
    engineers = db.query(User).filter(User.department_id == department_id).all()
    if not engineers:
        return None

    engineer_load = [
        (
            eng.id,
            db.query(func.count(Ticket.id)).filter(
                Ticket.assigned_to == eng.id,
                Ticket.status.in_(["open", "in_progress"])
            ).scalar()
        )
        for eng in engineers
    ]

    engineer_load.sort(key=lambda x: x[1])
    return engineer_load[0][0]


@router.post("/")
def create_ticket(ticket: TicketCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):

    assigned_department = ticket.department_id
    assigned_user = ticket.assigned_to

    if assigned_department is None:
        auto_dept = auto_assign_department(db)
        if auto_dept:
            assigned_department = auto_dept
            write_audit_log(
                db=db,
                user_id=current_user.id,
                action="auto_assign_department",
                target_table="tickets",
                target_id=None,
                details=f"자동으로 부서 {auto_dept} 배정됨",
                ip_address=None,
                user_agent=None,
                target_department_id=auto_dept
            )

    if assigned_user is None and assigned_department is not None:
        auto_user = auto_assign_user(db, assigned_department)
        if auto_user:
            assigned_user = auto_user
            write_audit_log(
                db=db,
                user_id=current_user.id,
                action="auto_assign_user",
                target_table="tickets",
                target_id=None,
                details=f"부서 {assigned_department} 엔지니어 {auto_user} 자동 배정됨",
                ip_address=None,
                user_agent=None,
                target_department_id=assigned_department
            )

    new_ticket = Ticket(
        title=ticket.title,
        description=ticket.description,
        priority=ticket.priority,
        status="open",
        created_by=current_user.id,
        assigned_to=assigned_user,
        department_id=assigned_department,
        created_at=datetime.now(),
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
    )

    return new_ticket
