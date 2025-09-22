#!/bin/bash

PGUSER=${POSTGRES_USER:-app}
PGPASSWORD=${POSTGRES_PASSWORD:-app_pw}
PGDATABASE=${POSTGRES_DB:-appdb}
PGHOST=${POSTGRES_HOST:-db}
export PGPASSWORD=$PGPASSWORD

echo "📦 백업 루프 시작"

while true
do
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  echo "🕐 백업 실행: $TIMESTAMP"
  pg_dump -h $PGHOST -U $PGUSER $PGDATABASE > /backup/backup_$TIMESTAMP.sql
  echo "✅ 백업 완료: backup_$TIMESTAMP.sql"
  sleep 3600
done
