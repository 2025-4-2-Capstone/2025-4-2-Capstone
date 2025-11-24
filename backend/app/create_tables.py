from sqlalchemy import create_engine, text
from app import models
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL이 .env에 없습니다!")

engine = create_engine(DATABASE_URL)

# bcrypt 제거 → sha256_crypt 사용
pwd_context = CryptContext(
    schemes=["sha256_crypt"],
    deprecated="auto"
)

print("📌 Using DB:", DATABASE_URL)

# ================================
# SCHEMA RESET
# ================================
print("⚠️ Dropping public schema...")
with engine.connect() as conn:
    conn.execute(text("DROP SCHEMA IF EXISTS public CASCADE;"))
    conn.execute(text("CREATE SCHEMA public;"))
print("🔄 SCHEMA recreated!")


# ================================
# CREATE TABLES
# ================================
print("⏳ Creating tables...")
models.Base.metadata.create_all(bind=engine)
print("✅ Tables created!")


# ================================
# Insert Base Data
# ================================
print("⏳ Inserting base data...")

with engine.begin() as conn:
    conn.execute(text("""
        INSERT INTO roles (id, name, hierarchy_level, description)
        VALUES
            (1, 'super_admin', 1, '시스템 전체 관리자'),
            (2, 'admin', 2, '부서 관리자'),
            (3, 'manager', 3, '부서 책임자'),
            (4, 'engineer', 4, '기술 담당자'),
            (5, 'staff', 5, '일반 사무직'),
            (6, 'user', 6, '일반 사용자'),
            (7, 'auditor', 7, '감사용 계정')
        ON CONFLICT (id) DO NOTHING;
    """))

    conn.execute(text("""
        INSERT INTO departments (id, name)
        VALUES
            (1, 'IT운영부'),
            (2, '보안감사부'),
            (3, '고객지원부'),
            (4, '관리지원부'),
            (5, '인사·교육부'),
            (6, '재무·회계부'),
            (7, '경영기획부')
        ON CONFLICT (id) DO NOTHING;
    """))

    conn.execute(text("""
        INSERT INTO sla_policies (id, priority, response_time_days, resolve_time_days)
        VALUES
            (1, 'low', 7, 30),
            (2, 'normal', 5, 21),
            (3, 'high', 3, 14),
            (4, 'urgent', 1, 7)
        ON CONFLICT (id) DO NOTHING;
    """))

print("✅ 기본 데이터 삽입 완료!")


# ================================
# SUPER ADMIN 생성
# ================================
print("⏳ Creating super admin user...")

hashed_pw = pwd_context.hash("capstone42")

with engine.begin() as conn:
    conn.execute(text("""
        INSERT INTO users (username, email, password_hash, role_id, department_id, is_active)
        VALUES ('capstone', 'capstone42@kunsan.com', :pw, 1, 1, TRUE)
        ON CONFLICT (username) DO NOTHING;
    """), {"pw": hashed_pw})

print("🎉 Super Admin 생성 완료!")
print("   ➤ username: capstone")
print("   ➤ password: capstone42")
print("====================================================")
print("🔥 DB 초기화 + Super Admin 생성 완료!")
print("====================================================")
