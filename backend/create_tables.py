from database import engine
from sqlalchemy import text
import models

print("⚠️ Dropping existing tables...")

# ✅ 뷰와 함수 먼저 제거 (먼저 실행되도록 확실히 분리)
with engine.begin() as conn:  # begin()은 autocommit 보장
    conn.execute(text("""
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'masked_users') THEN
                EXECUTE 'DROP VIEW masked_users CASCADE';
            END IF;
            IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_audit_logs') THEN
                EXECUTE 'DROP FUNCTION get_audit_logs() CASCADE';
            END IF;
        END$$;
    """))

print("✅ View & Function dropped if existed.")

# ✅ 테이블 전체 삭제 및 재생성
models.Base.metadata.drop_all(bind=engine)
print("⏳ Creating all tables...")
models.Base.metadata.create_all(bind=engine)
print("✅ Tables recreated successfully!")

# ✅ 기본 role(admin/tester) 데이터 추가
with engine.begin() as conn:
    conn.execute(text("""
        INSERT INTO roles (id, name)
        VALUES (1, 'admin'), (2, 'tester')
        ON CONFLICT (id) DO NOTHING;
    """))

print("✅ 기본 role(admin/tester) 데이터 추가 완료!")
