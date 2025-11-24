from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from pydantic import BaseModel
import uuid
import os

from app.database import get_db, set_db_role_context
import app.models as models
from app.utils.audit import write_audit_log

router = APIRouter()
bearer_scheme = HTTPBearer()

# 환경 변수
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# bcrypt 제거 → sha256_crypt 사용
pwd_context = CryptContext(
    schemes=["sha256_crypt"],
    deprecated="auto"
)

# ---------------------------
# Pydantic Models
# ---------------------------
class LoginRequest(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    email: str
    password: str


# ---------------------------
# Password Hashing
# ---------------------------
def verify_password(plain_pw: str, hashed_pw: str) -> bool:
    return pwd_context.verify(plain_pw, hashed_pw)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


# ---------------------------
# JWT 생성
# ---------------------------
def create_access_token(payload: dict, expires_delta: timedelta = None):
    to_encode = payload.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ---------------------------
# 로그인
# ---------------------------
@router.post("/login")
def login(login_data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == login_data.username).first()

    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="아이디 또는 비밀번호가 올바르지 않습니다.")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="관리자 승인 대기 중입니다.")

    session_id = str(uuid.uuid4())

    token_payload = {
        "sub": user.username,
        "uid": user.id,
        "role": user.role.name,
        "department_id": user.department_id,
        "is_active": user.is_active,
        "session_id": session_id,
        "ip": request.client.host,
        "ua": request.headers.get("User-Agent", "unknown"),
    }

    token = create_access_token(token_payload)

    write_audit_log(
        db=db,
        user_id=user.id,
        action="login",
        target_table="users",
        target_id=user.id,
        details=f"IP={request.client.host}, UA={request.headers.get('User-Agent','unknown')}",
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "username": user.username,
        "role": user.role.name,
        "department_id": user.department_id,
        "session_id": session_id,
    }


# ---------------------------
# JWT 인증
# ---------------------------
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    request: Request = None,
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        uid = payload.get("uid")
        role = payload.get("role")
    except JWTError:
        raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다.")

    user = db.query(models.User).filter(models.User.id == uid).first()
    if not user:
        raise HTTPException(status_code=401, detail="사용자를 찾을 수 없습니다.")

    # super_admin 제외 IP/UA 바인딩 검사
    if role != "super_admin":
        if payload.get("ip") != request.client.host:
            raise HTTPException(status_code=401, detail="IP 변경 감지됨 → 다시 로그인 필요")

        if payload.get("ua") != request.headers.get("User-Agent", "unknown"):
            raise HTTPException(status_code=401, detail="브라우저 정보 변경 감지됨 → 다시 로그인 필요")

    set_db_role_context(db, role, uid)

    return user


# ---------------------------
# 회원가입
# ---------------------------
@router.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="이미 존재하는 사용자명입니다.")

    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="이미 사용 중인 이메일입니다.")

    new_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=hash_password(user.password),
        role_id=6,
        department_id=1,
        is_active=False,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "회원가입 완료 (관리자 승인 필요)", "user_id": new_user.id}
