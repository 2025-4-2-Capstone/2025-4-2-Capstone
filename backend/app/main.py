from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, users, tickets, sla, audit, pii

app = FastAPI(
    title="Capstone Unified API",
    description="Authentication + Ticket + SLA + Audit + PII 통합 API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router 등록
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tickets.router)
app.include_router(sla.router)
app.include_router(audit.router)
app.include_router(pii.router)


@app.get("/")
def root():
    return {"message": "Capstone Unified API Running"}
