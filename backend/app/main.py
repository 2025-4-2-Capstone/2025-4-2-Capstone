from fastapi import FastAPI
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from app.db import get_connection  # ✅ 이 줄이 반드시 있어야 Swagger에 반영됨!

app = FastAPI(title="Capstone API")

def tick():
    pass  # SLA 임박/초과 알림 로직 나중에 작성

@app.on_event("startup")
def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(tick, "interval", minutes=5)
    scheduler.start()

@app.get("/health")
def health():
    return {"status": "ok", "time": datetime.utcnow().isoformat()}

@app.get("/test-db")
def test_db():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM roles")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {"roles": rows}
