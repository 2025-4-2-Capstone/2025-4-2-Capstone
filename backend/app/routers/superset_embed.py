from fastapi import APIRouter
from pydantic import BaseModel
import jwt, time

router = APIRouter(prefix="/embed", tags=["Superset Embed"])

# ⚠️ Superset GUEST_TOKEN_JWT_SECRET과 동일해야 함
SUPERSET_SECRET_KEY = "H3s02Kdf9sKfd3pSkwo39lskfds0lsdf39023ks=="

# 역할별 대시보드 UUID 매핑 (고정)
ROLE_DASHBOARDS = {
    "super_admin": "abc123xyz",
    "admin": "13816037-2392-4cb8-848b-d63c2e81d797",  # 고정 UUID
    "manager": "dept456def",
    "engineer": "eng789ghi",
    "user": "usr111aaa",
    "staff": "usr111aaa",
    "auditor": "adt222bbb",
}

# 요청 모델 (username, role 항상 admin)
class TokenRequest(BaseModel):
    username: str = "admin"
    role: str = "admin"

@router.post("/token")
def create_embed_token(req: TokenRequest):
    # username, role 무조건 admin
    username = "admin"
    role = "admin"

    # 역할에 해당하는 대시보드 UUID
    dashboard_id = ROLE_DASHBOARDS.get(role)
    if not dashboard_id:
        return {"error": "Invalid role"}

    # JWT 페이로드
    payload = {
        "user": {"username": username, "first_name": "Admin", "last_name": "User"},
        "resources": [{"type": "dashboard", "id": dashboard_id}],
        "rls_rules": [],
        "iat": int(time.time()),
        "exp": int(time.time()) + 600,  # 10분 유효
        "aud": "superset",             # superset_config.py GUEST_TOKEN_JWT_AUDIENCE와 일치
        "type": "guest"
    }

    # 토큰 생성
    token = jwt.encode(payload, SUPERSET_SECRET_KEY, algorithm="HS256")

    return {
        "token": token,
        "embed_url": f"http://localhost:8088/embedded/{dashboard_id}?token={token}"
    }
