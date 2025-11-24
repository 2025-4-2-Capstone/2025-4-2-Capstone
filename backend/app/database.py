# database.py
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# 환경변수 로드
load_dotenv()

# DATABASE_URL 불러오기
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL not found in .env file!")

# 로컬 개발 시: localhost:5432
# 도커 내부 실행 시: db:5432
# 👉 DATABASE_URL만 변경하면 자동 처리됨
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 로그인 된 사용자 정보 전달용
def set_db_role_context(db, role: str, user_id: int):
    db.execute(
        text("SELECT set_config('app.current_user_id', :uid, false)"),
        {"uid": str(user_id)}
    )
    db.execute(
        text("SELECT set_config('app.current_role', :role, false)"),
        {"role": role}
    )
