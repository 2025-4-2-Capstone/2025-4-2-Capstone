# ----------------------------------------
# 1) 기본 설정
# ----------------------------------------
ENABLE_PROXY_FIX = True                # 프록시 환경에서 필요
SECRET_KEY = "H3s02Kdf9sKfd3pSkwo39lskfds0lsdf39023ks=="
SUPERSET_WEBSERVER_PORT = 8088

# ----------------------------------------
# 2) 기능 플래그
# ----------------------------------------
FEATURE_FLAGS = {
    "EMBEDDED_SUPERSET": True,         # 임베딩 기능 활성화
}

# ----------------------------------------
# 3) Guest Token 설정
# ----------------------------------------
GUEST_TOKEN_JWT_SECRET = "H3s02Kdf9sKfd3pSkwo39lskfds0lsdf39023ks=="  # 백엔드와 동일
GUEST_TOKEN_JWT_AUDIENCE = "superset"
GUEST_ROLE_NAME = "Admin"            # UI에서 Roles > Public 생성 후 Can read Dashboard 권한 추가

# ----------------------------------------
# 4) CORS 설정 (iframe 접근 허용)
# ----------------------------------------
ENABLE_CORS = True

# ----------------------------------------
# 5) iframe sandbox / referrer 정책
# ----------------------------------------
REFERRER_POLICY = "same-origin"
