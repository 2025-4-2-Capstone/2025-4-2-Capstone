from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import atexit

import app.models as models
from app.database import get_db, SessionLocal
from app.routers.auth import get_current_user

router = APIRouter(tags=["SLA"])


# ============================
# 🔥 SLA ALERT RESOLVE API
# ============================
@router.put("/sla-alerts/{alert_id}/resolve")
def resolve_sla_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    alert = db.query(models.SLAAlert).filter(models.SLAAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    if alert.resolved:
        raise HTTPException(status_code=400, detail="Alert already resolved")

    alert.resolved = True
    db.commit()

    return {"message": "Alert resolved successfully", "alert_id": alert_id}


# ============================
# 🔥 SLA ALERT LIST API (관리자용)
# ============================
@router.get("/sla-alerts")
def get_sla_alerts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """관리자가 SLA 알림을 확인할 수 있도록 Ticket JOIN 결과를 반환"""

    # 관리자 권한 체크
    if current_user.role.name not in ["super_admin", "admin", "manager"]:
        raise HTTPException(status_code=403, detail="SLA 알림은 관리자만 조회할 수 있습니다.")

    alerts = (
        db.query(models.SLAAlert, models.Ticket)
        .join(models.Ticket, models.SLAAlert.ticket_id == models.Ticket.id)
        .order_by(models.SLAAlert.id.desc())
        .all()
    )

    result = []
    for alert, ticket in alerts:
        result.append({
            "alert_id": alert.id,
            "ticket_id": ticket.id,
            "title": ticket.title,
            "priority": ticket.priority,
            "status": ticket.status,
            "alert_type": alert.alert_type,
            "triggered_at": alert.triggered_at,
            "resolved": alert.resolved
        })

    return result


# ============================
# 🔥 SLA VIOLATION CHECK LOGIC
# ============================
def check_sla_violations():
    db = SessionLocal()
    now = datetime.now(timezone.utc)

    tickets = db.query(models.Ticket).filter(
        models.Ticket.status.in_(["open", "in_progress"])
    ).all()

    for ticket in tickets:
        sla = db.query(models.SlaPolicy).filter(
            models.SlaPolicy.id == ticket.sla_policy_id
        ).first()

        if not sla:
            continue

        created = ticket.created_at
        if not created:
            continue

        # timezone 추가
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)

        # ===============================
        # 🔥 URGENT 티켓 → 30초 SLA
        # ===============================
        if ticket.priority == "urgent":
            response_deadline = created + timedelta(seconds=30)
            resolve_deadline = created + timedelta(seconds=30)

        # ===============================
        # 🔥 그 외 priority는 기존 SLA(day)
        # ===============================
        else:
            response_deadline = created + timedelta(days=sla.response_time_days)
            resolve_deadline = created + timedelta(days=sla.resolve_time_days)

        # 위반 여부 판단
        response_violation = ticket.status == "open" and now > response_deadline
        resolution_violation = now > resolve_deadline

        existing_alerts = db.query(models.SLAAlert).filter(
            models.SLAAlert.ticket_id == ticket.id
        ).all()
        existing_types = [a.alert_type for a in existing_alerts]

        # 응답 시간 초과
        if response_violation and "response_delay" not in existing_types:
            db.add(models.SLAAlert(
                ticket_id=ticket.id,
                alert_type="response_delay",
                triggered_at=now
            ))

        # 해결 시간 초과
        if resolution_violation and "resolution_delay" not in existing_types:
            db.add(models.SLAAlert(
                ticket_id=ticket.id,
                alert_type="resolution_delay",
                triggered_at=now
            ))

    db.commit()
    db.close()


# ============================
# 🔥 BACKGROUND SCHEDULER
# ============================
scheduler = BackgroundScheduler()
scheduler.start()
scheduler.add_job(
    func=check_sla_violations,
    trigger=IntervalTrigger(seconds=60),
    id="sla_check",
    name="Check SLA Violations every 60 seconds",
    replace_existing=True
)

atexit.register(lambda: scheduler.shutdown())


# ============================
# 🔥 SLA TEST API
# ============================
@router.get("/test-sla-run")
def manual_sla_run():
    check_sla_violations()
    return {"msg": "SLA check 실행됨"}
