from sqlalchemy import create_engine, text
from app import models
import bcrypt
import os
from dotenv import load_dotenv

# ================================
# 1) .env 로드 및 DB URL 설정
# ================================
load_dotenv()

# ⛔ OneDrive 환경에서 env 꼬임 방지: 강제 override
os.environ["DATABASE_URL"] = "postgresql://app:app_pw@localhost:5432/appdb"

DATABASE_URL = os.environ["DATABASE_URL"]
engine = create_engine(DATABASE_URL)

print("📌 Using DB:", DATABASE_URL)


# ================================
# 2) CASCADE 초기화 (뷰/테이블 전부 삭제)
# ================================
print("⚠️ Dropping SCHEMA public CASCADE...")
with engine.connect() as conn:
    conn.execute(text("DROP SCHEMA IF EXISTS public CASCADE;"))
    conn.execute(text("CREATE SCHEMA public;"))
print("🔄 SCHEMA recreated!")


# ================================
# 3) 모든 테이블 재생성
# ================================
print("⏳ Creating tables from models.py...")
models.Base.metadata.create_all(bind=engine)
print("✅ Tables created successfully!")


# ================================
# 4) 기본 데이터 삽입 (Roles, Departments, SLA)
# ================================
print("⏳ Inserting base data...")

with engine.begin() as conn:
    # Roles
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

    # Departments
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

    # SLA Policies
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
# 5) super admin 계정 자동 생성
# ================================
print("⏳ Creating Super Admin account...")

plain_pw = "capstone42"
hashed_pw = bcrypt.hashpw(plain_pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

with engine.begin() as conn:
    conn.execute(text(f"""
        INSERT INTO users (username, email, password_hash, role_id, department_id, is_active)
        VALUES ('capstone', 'capstone42@kunsan.com', '{hashed_pw}', 1, 1, TRUE)
        ON CONFLICT (username) DO NOTHING;
    """))

print("🎉 Super Admin 생성 완료!")
print("    ➤ username: capstone")
print("    ➤ password: capstone42")
print("    ➤ role: super_admin")
print("====================================================")
print("🔥 DB가 완전히 초기화되고 기본 데이터가 준비되었습니다!")
print("====================================================")
