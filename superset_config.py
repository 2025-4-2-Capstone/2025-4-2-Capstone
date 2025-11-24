# ----------------------------------------
# Superset Embedded SDK + Guest Token 설정
# ----------------------------------------

ENABLE_PROXY_FIX = True  # Nginx/프록시 환경에서 필요
SECRET_KEY = "H3s02Kdf9sKfd3pSkwo39lskfds0lsdf39023ks=="

SUPERSET_WEBSERVER_PORT = 8088

FEATURE_FLAGS = {
    "EMBEDDED_SUPERSET": True,   # 임베딩 기능 사용
}

# Guest Token 설정 (Embedded SDK / JWT)
GUEST_TOKEN_JWT_SECRET = "H3s02Kdf9sKfd3pSkwo39lskfds0lsdf39023ks=="
GUEST_TOKEN_JWT_AUDIENCE = "superset"
GUEST_ROLE_NAME = "Admin"  # Superset Roles에서 생성, Can read Dashboard 권한 필요

# CORS 허용
WTF_CSRF_ENABLED = False
TALISMAN_ENABLED = False
HTTP_HEADERS = {
    "X-Frame-Options": "ALLOWALL",
    "Content-Security-Policy": "frame-ancestors *",
}