from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


import app.models as models
from app.database import get_db
from app.routers.auth import get_current_user

router = APIRouter(tags=["Audit Logs"])

class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    target_table: str
    target_id: int
    details: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True   # Pydantic V2 방식


@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        result = db.execute(
            text("SELECT * FROM get_audit_logs(:role)")
            .bindparams(role=current_user.role.name)
        ).fetchall()

        return [dict(row._mapping) for row in result]

    except Exception as e:
        raise HTTPException(status_code=403, detail=str(e))
