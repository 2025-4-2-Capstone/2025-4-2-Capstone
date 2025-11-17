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
# 🔥 SLA VIOLATION CHECK LOGIC
# ============================
def check_sla_violations():
    db = SessionLocal()
    now = datetime.utcnow()  # timezone-aware 문제 방지

    tickets = db.query(models.Ticket).filter(
        models.Ticket.status.in_(["open", "in_progress"])
    ).all()

    for ticket in tickets:
        # SLA 정책 가져오기 (일 단위)
        sla = db.query(models.SlaPolicy).filter(
            models.SlaPolicy.id == ticket.sla_policy_id
        ).first()

        if not sla:
            continue

        created = ticket.created_at
        if not created:
            continue

        # -------------------------------
        # ⭐ 일(Day) 단위 SLA 계산
        # -------------------------------
        response_deadline = created + timedelta(days=sla.response_time_days)
        resolve_deadline = created + timedelta(days=sla.resolve_time_days)

        response_violation = ticket.status == "open" and now > response_deadline
        resolution_violation = now > resolve_deadline

        # 기존 알림 조회
        existing_alerts = db.query(models.SLAAlert).filter(
            models.SLAAlert.ticket_id == ticket.id
        ).all()

        existing_types = [a.alert_type for a in existing_alerts]

        # 응답지연(Response Delay) 알림
        if response_violation and "response_delay" not in existing_types:
            alert = models.SLAAlert(
                ticket_id=ticket.id,
                alert_type="response_delay",
                triggered_at=now
            )
            db.add(alert)

        # 해결지연(Resolution Delay) 알림
        if resolution_violation and "resolution_delay" not in existing_types:
            alert = models.SLAAlert(
                ticket_id=ticket.id,
                alert_type="resolution_delay",
                triggered_at=now
            )
            db.add(alert)

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
