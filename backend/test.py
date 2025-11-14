from dotenv import load_dotenv
import os

# .env 파일 불러오기
load_dotenv()

# 환경변수 읽기
db_url = os.getenv("DATABASE_URL")
secret = os.getenv("SECRET_KEY")
expire = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")

print("✅ DATABASE_URL:", db_url)
print("✅ SECRET_KEY:", secret)
print("✅ ACCESS_TOKEN_EXPIRE_MINUTES:", expire)
