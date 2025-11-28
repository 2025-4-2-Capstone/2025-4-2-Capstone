from sqlalchemy.orm import Session
from datetime import datetime
from app.models import AuditLog
import json

def write_audit_log(
    db: Session,
    user_id: int,
    action: str,
    target_table: str,
    target_id: int,
    details: str = "",
    request=None,
    changed_fields=None,
    ip_address: str = None,
    user_agent: str = None,
    target_department_id: int = None
):
    # dict가 들어오면 JSON 문자열로 변환
    if isinstance(changed_fields, dict):
        changed_fields = json.dumps(changed_fields, ensure_ascii=False)

    # request로부터 IP/UA 추출
    if request:
        ip_address = request.headers.get("X-Forwarded-For") or request.client.host
        user_agent = request.headers.get("User-Agent")

        auth_header = request.headers.get("Authorization", "")
        session_id = auth_header.replace("Bearer ", "")[:40] if auth_header.startswith("Bearer ") else None
    else:
        session_id = None

    log = AuditLog(
        user_id=user_id,
        action=action,
        target_table=target_table,
        target_id=target_id,
        details=details,
        timestamp=datetime.utcnow(),
        session_id=session_id,
        ip_address=ip_address,
        user_agent=user_agent,
        changed_fields=changed_fields,
        target_department_id=target_department_id
    )

    db.add(log)
    db.commit()
