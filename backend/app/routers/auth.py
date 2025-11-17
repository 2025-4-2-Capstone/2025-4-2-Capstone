from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import timedelta, datetime
from jose import jwt, JWTError
from pydantic import BaseModel
from passlib.context import CryptContext
import os

from app.database import get_db, set_db_role_context
import app.models as models

router = APIRouter()

# 보안 설정
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 🔵 OAuth2PasswordBearer 제거
bearer_scheme = HTTPBearer()   # ✔ Swagger에서 토큰만 입력하도록 설정


# ----------- Pydantic Models -----------

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

# ✔ 로그인 전용 모델 추가
class LoginRequest(BaseModel):
    username: str
    password: str

# ----------- Password Utils -----------

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_pw: str, hashed_pw: str) -> bool:
    return pwd_context.verify(plain_pw, hashed_pw)


# ----------- JWT 생성 -----------

def create_access_token(user, expires_delta: timedelta = None):
    to_encode = {
        "sub": user.username,
        "uid": user.id,
        "role": user.role.name,
        "department_id": user.department_id,
        "is_active": user.is_active
    }

    expire = datetime.utcnow() + (expires_delta or timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    ))
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ----------- JWT 인증 -----------

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    credentials_exception = HTTPException(
        status_code=401,
        detail="유효하지 않은 인증 정보입니다.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        username = payload.get("sub")
        role = payload.get("role")
        uid = payload.get("uid")
        department_id = payload.get("department_id")
        is_active = payload.get("is_active")

        if not username or not role or not uid:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise credentials_exception

    if user.is_active != is_active:
        raise HTTPException(status_code=403, detail="사용자 활성화 상태가 유효하지 않습니다.")

    if user.department_id != department_id:
        raise HTTPException(status_code=403, detail="부서 정보 불일치")

    set_db_role_context(db, role, uid)

    return user


# ----------- 회원가입 -----------

@router.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="이미 존재하는 사용자명입니다.")

    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="이미 사용 중인 이메일입니다.")

    new_user = models.User(
        username=user.username,
        email=user.email,
        role_id=6,             # 기본 user
        department_id=None,    # 부서 없음
        password_hash=hash_password(user.password),
        is_active=False        # 관리자 승인 필요
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "회원가입 완료 (관리자 승인 필요)",
        "user_id": new_user.id,
        "is_active": new_user.is_active
    }


# ----------- 로그인 -----------

@router.post("/login")
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == login_data.username).first()

    if not db_user or not verify_password(login_data.password, db_user.password_hash):
        raise HTTPException(status_code=400, detail="아이디 또는 비밀번호가 올바르지 않습니다.")

    if not db_user.is_active:
        raise HTTPException(status_code=403, detail="관리자 승인 대기 중입니다.")

    token = create_access_token(db_user)

    return {
        "access_token": token,
        "token_type": "bearer",
        "username": db_user.username,
        "role": db_user.role.name,
        "department_id": db_user.department_id,
        "is_active": db_user.is_active
    }

