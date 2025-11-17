# database.py
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL not found in .env file!")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ✅ [추가] 로그인된 사용자의 role/id를 DB 세션에 전달하는 함수
def set_db_role_context(db, role: str, user_id: int):
    db.execute(text("SELECT set_config('app.current_user_id', :uid, false)"), {"uid": str(user_id)})
    db.execute(text("SELECT set_config('app.current_role', :role, false)"), {"role": role})

