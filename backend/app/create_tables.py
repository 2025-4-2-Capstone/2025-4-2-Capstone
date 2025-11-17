from database import engine
from sqlalchemy import text
import models
import bcrypt

print("⚠️ Dropping existing tables...")

# 1) 기존 모든 테이블 삭제 후 재생성
models.Base.metadata.drop_all(bind=engine)
print("⏳ Creating all tables...")
models.Base.metadata.create_all(bind=engine)
print("✅ Tables recreated successfully!")

# 2) bcrypt로 비밀번호 해시 생성
plain_pw = "capstone42"
hashed_pw = bcrypt.hashpw(plain_pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

# 3) 기본 Role 데이터 생성
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
print("✅ Roles inserted")

# 4) 기본 Department 데이터 생성
with engine.begin() as conn:
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
print("✅ Departments inserted")

# 5) 새 SLA 정책 테이블 기반 데이터 자동 생성 (일 기준)
with engine.begin() as conn:
    conn.execute(text("""
        INSERT INTO sla_policies (id, priority, response_time_days, resolve_time_days)
        VALUES
            (1, 'low', 7, 30),
            (2, 'normal', 5, 21),
            (3, 'high', 3, 14),
            (4, 'urgent', 1, 7)
        ON CONFLICT (id) DO NOTHING;
    """))
print("✅ SLA 정책(일 단위) 생성 완료")

# 6) 슈퍼 관리자 계정 자동 생성
with engine.begin() as conn:
    conn.execute(text(f"""
        INSERT INTO users (username, email, password_hash, role_id, department_id, is_active)
        VALUES ('capstone', 'capstone42@kunsan.com', '{hashed_pw}', 1, 1, TRUE)
        ON CONFLICT (username) DO NOTHING;
    """))

print("✅ Super Admin 계정(capstone) 자동 생성 완료!")
print("    ➤ username: capstone")
print("    ➤ password: capstone42")
print("    ➤ role: super_admin")
