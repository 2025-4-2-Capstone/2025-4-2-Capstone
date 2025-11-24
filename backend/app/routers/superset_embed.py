from fastapi import APIRouter
from pydantic import BaseModel
import jwt, time

router = APIRouter(prefix="/embed", tags=["Superset Embed"])
SUPERSET_SECRET_KEY = "H3s02Kdf9sKfd3pSkwo39lskfds0lsdf39023ks=="

ROLE_DASHBOARDS = {
    "admin": "5faa52f0-f0b1-44d2-8c13-62645fba4a1d",
    "auditor": "561eca0f-5e48-4a1e-acea-e844092f8f84",
    "engineer": "b035582c-352a-4d81-b905-40db9eeb5882",
    "manager": "c13dbc21-e87f-4e27-928a-0fcaa66854dd",
    "user": "ba851113-5ee5-41d8-9c12-e3776d2dfd08",
    "staff": "ba851113-5ee5-41d8-9c12-e3776d2dfd08",
}

class TokenRequest(BaseModel):
    username: str
    role: str

@router.post("/token")
def create_embed_token(req: TokenRequest):
    username = "admin"  # 항상 admin
    role = req.role

    dashboard_id = ROLE_DASHBOARDS.get(role)
    if not dashboard_id:
        return {"error": "Invalid role"}

    now = int(time.time())

    payload = {
        # ===================================
        # Superset 필수 구조 (절대 삭제 X)
        # ===================================
        "user": {
            "username": username,
            "first_name": "",
            "last_name": ""
        },
        "resources": [
            {"type": "dashboard", "id": dashboard_id}
        ],
        "rls_rules": [],
        "aud": "superset",
        "type": "guest",

        # ===================================
        # 너가 원하는 커스텀 필드 (Superset은 무시함)
        # ===================================
        "role": role,
        "dashboard": dashboard_id,

        # ===================================
        # Meta
        # ===================================
        "iat": now,
        "exp": now + 600,
    }

    token = jwt.encode(payload, SUPERSET_SECRET_KEY, algorithm="HS256")

    return {
        "token": token,
        "dashboard": dashboard_id,
        "embed_url": f"http://localhost:8088/embedded/{dashboard_id}?token={token}"
    }
