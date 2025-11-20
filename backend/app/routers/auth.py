from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import timedelta, datetime
from jose import jwt, JWTError
from pydantic import BaseModel
from passlib.context import CryptContext
import uuid
import os

from app.database import get_db, set_db_role_context
import app.models as models
from app.utils.audit import write_audit_log


router = APIRouter()

# -----------------------------
# 보안 설정
# -----------------------------
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

bearer_scheme = HTTPBearer()   # ✔ Swagger에서 토큰만 입력하도록


# -----------------------------
# Pydantic Models
# -----------------------------
class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


# -----------------------------
# Password Utils
# -----------------------------
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_pw: str, hashed_pw: str) -> bool:
    return pwd_context.verify(plain_pw, hashed_pw)


# -----------------------------
# JWT 생성 (확장 버전)
# -----------------------------
def create_access_token(payload: dict, expires_delta: timedelta = None):
    to_encode = payload.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# -----------------------------
# 로그인
# -----------------------------
@router.post("/login")
def login(
    login_data: LoginRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    db_user = db.query(models.User).filter(
        models.User.username == login_data.username
    ).first()

    if not db_user or not verify_password(login_data.password, db_user.password_hash):
        raise HTTPException(status_code=400, detail="아이디 또는 비밀번호가 올바르지 않습니다.")

    if not db_user.is_active:
        raise HTTPException(status_code=403, detail="관리자 승인 대기 중입니다.")

    # ⭐ JWT 확장 요소 3종 추가
    session_id = str(uuid.uuid4())
    client_ip = request.client.host
    user_agent = request.headers.get("User-Agent", "unknown")

    token_payload = {
        "sub": db_user.username,
        "uid": db_user.id,
        "role": db_user.role.name,
        "department_id": db_user.department_id,
        "is_active": db_user.is_active,
        "session_id": session_id,
        "ip": client_ip,
        "ua": user_agent,
    }

    access_token = create_access_token(token_payload)

    # 감사 로그 기록
    write_audit_log(
        db=db,
        user_id=db_user.id,
        action="login",
        target_table="users",
        target_id=db_user.id,
        details=f"session_id={session_id}, ip={client_ip}, ua={user_agent}",
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": db_user.username,
        "role": db_user.role.name,
        "department_id": db_user.department_id,
        "session_id": session_id
    }


# -----------------------------
# JWT 인증 (확장 버전)
# -----------------------------
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    request: Request = None,
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        username = payload.get("sub")
        role = payload.get("role")
        uid = payload.get("uid")
        dept = payload.get("department_id")

        token_ip = payload.get("ip")
        token_ua = payload.get("ua")
        session_id = payload.get("session_id")

        if not username or not role or not uid:
            raise JWTError("Invalid token payload")

    except JWTError:
        raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다.")

    # DB 사용자 조회
    user = db.query(models.User).filter(models.User.id == uid).first()
    if not user:
        raise HTTPException(status_code=401, detail="사용자를 찾을 수 없습니다.")

    # -----------------------------
    # 🔥 IP / User-Agent 검증 (super_admin 제외)
    # -----------------------------
    if role != "super_admin":
        request_ip = request.client.host
        request_ua = request.headers.get("User-Agent", "unknown")

        if token_ip != request_ip:
            raise HTTPException(status_code=401, detail="IP 변경 감지됨 → 다시 로그인 필요")

        if token_ua != request_ua:
            raise HTTPException(status_code=401, detail="브라우저 정보 변경 감지됨 → 다시 로그인 필요")

    # DB Session Context 설정
    set_db_role_context(db, role, uid)

    return user


# -----------------------------
# 회원가입
# -----------------------------
@router.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="이미 존재하는 사용자명입니다.")

    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="이미 사용 중인 이메일입니다.")

    new_user = models.User(
        username=user.username,
        email=user.email,
        role_id=6,           # 기본 user
        department_id=None,  # 부서 없음
        password_hash=hash_password(user.password),
        is_active=False
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "회원가입 완료 (관리자 승인 필요)",
        "user_id": new_user.id,
        "is_active": new_user.is_active
    }
