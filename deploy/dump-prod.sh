#!/usr/bin/env bash
# Дамп продакшена (ничего не удаляет!):
#   NEON_DATABASE_URL="postgresql://…"  BLOB_READ_WRITE_TOKEN="vercel_blob_rw_…"  deploy/dump-prod.sh
# Результат в deploy/backup/: neon-<дата>.sql (+ ссылка latest.sql),
# uploads/ со скриншотами и rewrite-screenshots.sql (blob-URL -> /uploads/…).
set -euo pipefail
cd "$(dirname "$0")/.."

: "${NEON_DATABASE_URL:?Нужна переменная NEON_DATABASE_URL (строка подключения Neon)}"

PGDUMP="$(command -v pg_dump || echo /opt/homebrew/opt/postgresql@17/bin/pg_dump)"
STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p deploy/backup

echo "==> pg_dump из Neon…"
"$PGDUMP" "$NEON_DATABASE_URL" \
  --no-owner --no-privileges --format=plain \
  --file="deploy/backup/neon-$STAMP.sql"
ln -sf "neon-$STAMP.sql" deploy/backup/latest.sql
echo "    deploy/backup/neon-$STAMP.sql ($(du -h "deploy/backup/neon-$STAMP.sql" | cut -f1))"

if [ -n "${BLOB_READ_WRITE_TOKEN:-}" ]; then
  echo "==> Скриншоты из Vercel Blob…"
  node deploy/download-blobs.mjs
else
  echo "!! BLOB_READ_WRITE_TOKEN не задан — скриншоты не скачаны"
fi

echo "✅ Дамп готов (прод не тронут)"
