from sqlalchemy.orm import Session
from datetime import datetime
from app.models import AuditLog
from app import models
import json

def write_audit_log(
    db: Session,
    user_id: int,
    action: str,
    target_table: str,
    target_id: int,
    details: str = "",
    request=None,
    changed_fields: str = None,
    target_department_id: int = None
):
    """
    고급 감사 로그 기록 함수
    """

    client_ip = None
    user_agent = None
    session_id = None

    # ⭐ Request가 넘어온 경우 IP/UA/JWT 세션 추출
    if request:
        client_ip = request.headers.get("X-Forwarded-For") or request.client.host
        user_agent = request.headers.get("User-Agent")

        # Authorization 헤더에서 JWT 일부만 저장
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            raw_jwt = auth_header.replace("Bearer ", "")
            session_id = raw_jwt[:40]     # 토큰 앞 40자만 저장 (보안상 안전)

    log = AuditLog(
        user_id=user_id,
        action=action,
        target_table=target_table,
        target_id=target_id,
        details=details,
        timestamp=datetime.utcnow(),

        # 🔥 추가된 감사지표들 저장
        session_id=session_id,
        ip_address=client_ip,
        user_agent=user_agent,
        changed_fields=changed_fields,
        target_department_id=target_department_id
    )

    db.add(log)
    db.commit()