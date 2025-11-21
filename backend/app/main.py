from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, users, tickets, sla, audit, pii
from app.routers import superset_embed   # 🔥 추가된 라우터 (중요)

app = FastAPI(
    title="Capstone Unified API",
    description="Authentication + Ticket + SLA + Audit + PII 통합 API + Superset Embed",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],         # 필요 시 프론트 도메인으로 제한 가능
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔥 API Router 등록
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tickets.router)
app.include_router(sla.router)
app.include_router(audit.router)
app.include_router(pii.router)
app.include_router(superset_embed.router)   # 🔥 반드시 있어야 함 (임베딩 토큰 발급용)

@app.get("/")
def root():
    return {"message": "Capstone Unified API Running"}
