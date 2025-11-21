from fastapi import APIRouter
from pydantic import BaseModel
import jwt, time

router = APIRouter(prefix="/embed", tags=["Superset Embed"])

# ⚠️ Superset과 동일해야 하는 SECRET_KEY
SUPERSET_SECRET_KEY = "H3s02Kdf9sKfd3pSkwo39lskfds0lsdf39023ks=="

# 역할별 대시보드 매핑 (임시 예시)
ROLE_DASHBOARDS = {
    "super_admin": "abc123xyz",
    "admin": "abc123xyz",
    "manager": "dept456def",
    "engineer": "eng789ghi",
    "user": "usr111aaa",
    "staff": "usr111aaa",
    "auditor": "adt222bbb",
}

class TokenRequest(BaseModel):
    username: str
    role: str

@router.post("/token")
def create_embed_token(req: TokenRequest):
    dashboard_id = ROLE_DASHBOARDS.get(req.role)

    if not dashboard_id:
        return {"error": "Invalid role"}

    payload = {
        "user": req.username,
        "role": req.role,
        "dashboard": dashboard_id,
        "iat": time.time(),
        "exp": time.time() + 600,  # 10분 유효
    }

    token = jwt.encode(payload, SUPERSET_SECRET_KEY, algorithm="HS256")

    return {
        "token": token,
        "embed_url": f"http://localhost:8088/embedded/{dashboard_id}?token={token}"
    }
