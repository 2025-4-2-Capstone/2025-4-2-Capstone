from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

import app.models as models
from app.database import get_db
from app.routers.auth import get_current_user

router = APIRouter(tags=["Audit Logs"])


# ============================
# 📌 AuditLog Response Model
# ============================
class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    target_table: str
    target_id: int
    details: Optional[str]
    changed_fields: Optional[dict]   # JSON
    ip_address: Optional[str]
    user_agent: Optional[str]
    target_department_id: Optional[int]
    timestamp: datetime

    class Config:
        from_attributes = True


# ============================
# 📌 감사 로그 조회 API
# ============================
@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    role = current_user.role.name

    # -----------------------------
    # super_admin / auditor: 전체 조회
    # admin: 자기 부서 로그만 조회
    # 일반 사용자: 자기 로그만 조회
    # -----------------------------

    if role == "super_admin" or role == "auditor":
        query = """
        SELECT * FROM audit_logs ORDER BY timestamp DESC
        """

    elif role == "admin":
        query = """
        SELECT * FROM audit_logs
        WHERE target_department_id = :dept
        ORDER BY timestamp DESC
        """

    else:
        query = """
        SELECT * FROM audit_logs
        WHERE user_id = :uid
        ORDER BY timestamp DESC
        """

    try:
        result = db.execute(
            text(query),
            {
                "dept": current_user.department_id,
                "uid": current_user.id
            }
        ).fetchall()

        return [dict(row._mapping) for row in result]

    except Exception as e:
        raise HTTPException(status_code=403, detail=str(e))