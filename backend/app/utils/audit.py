from sqlalchemy.orm import Session
from datetime import datetime
from app.models import AuditLog

def write_audit_log(
    db: Session,
    user_id: int,
    action: str,
    target_table: str,
    target_id: int,
    details: str
):
    log = AuditLog(
        user_id=user_id,
        action=action,
        target_table=target_table,
        target_id=target_id,
        details=details,
        timestamp=datetime.utcnow()
    )
    db.add(log)
    db.commit()
