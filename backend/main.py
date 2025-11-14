from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import SessionLocal
import models
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Optional
from fastapi.openapi.utils import get_openapi
from dotenv import load_dotenv
import os
from database import get_db, set_db_role_context 

# ✅ .env 불러오기
load_dotenv()

# --- 🔐 보안 설정 (.env에서 로드) ---
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI(title="Capstone API")

# --- DB 세션 ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- 📦 Pydantic 스키마 ---
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role_id: int  # admin=1, operator=2, auditor=3

# --- 🔐 Token 인증 설정 ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_pw: str, hashed_pw: str) -> bool:
    return pwd_context.verify(plain_pw, hashed_pw)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# --- ✅ 현재 사용자 조회 ---
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
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
        if not username or not role or not uid:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise credentials_exception

    # ✅ DB 세션에 현재 사용자 역할/ID 반영
    set_db_role_context(db, role, uid)

    return user

# --- ✅ 역할 기반 접근 제어 ---
def role_required(allowed_roles: list[str]):
    def wrapper(current_user: models.User = Depends(get_current_user)):
        if current_user.role.name not in allowed_roles:
            raise HTTPException(status_code=403, detail="접근 권한이 없습니다.")
        return current_user
    return Depends(wrapper)

# --- ✅ 회원가입 ---
@app.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="이미 존재하는 사용자명입니다.")

    new_user = models.User(
        username=user.username,
        email=user.email,
        role_id=user.role_id,
        password_hash=hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "회원가입 완료", "user_id": new_user.id}

# --- ✅ 로그인 (Swagger 폼 기반) ---
# main.py (로그인 부분 수정)
@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="아이디 또는 비밀번호가 올바르지 않습니다.")

    # ✅ 토큰에 role과 user_id도 함께 포함
    token_data = {
        "sub": user.username,
        "role": user.role.name,
        "uid": user.id
    }
    token = create_access_token(data=token_data)
    return {"access_token": token, "token_type": "bearer"}

# --- ✅ 현재 사용자 정보 ---
@app.get("/me")
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role.name
    }

# --- ✅ 관리자만 접근 가능한 API ---
@app.get("/admin-only")
def admin_only(current_user: models.User = role_required(["admin"])):
    return {"message": f"관리자 {current_user.username}님 환영합니다."}

# --- ✅ 관리자 또는 운영자 접근 가능한 API ---
@app.get("/operator-or-admin")
def operator_or_admin(current_user: models.User = role_required(["admin", "operator"])):
    return {"message": f"{current_user.role.name} 권한으로 접근 성공!"}

# --- ✅ Swagger용 custom_openapi ---
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Capstone API",
        version="1.0.0",
        description="Swagger에서 토큰 인증 테스트 가능하도록 수정",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "bearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    for path in openapi_schema["paths"].values():
        for operation in path.values():
            operation["security"] = [{"bearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
