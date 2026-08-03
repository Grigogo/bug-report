#!/usr/bin/env bash
# Восстанавливает дамп прода в докерный Postgres и заливает скриншоты в том.
#   deploy/restore-into-docker.sh [путь-к-дампу.sql]
# По умолчанию берёт deploy/backup/latest.sql.
# ВНИМАНИЕ: очищает ТОЛЬКО докерную БД (контейнер db), прод не трогает.
set -euo pipefail
cd "$(dirname "$0")/.."

DUMP="${1:-deploy/backup/latest.sql}"
[ -f "$DUMP" ] || { echo "Дамп не найден: $DUMP"; exit 1; }

echo "==> Поднимаю контейнер БД…"
docker compose up -d --wait db

PSQL=(docker compose exec -T db psql -U bugreport -d bugreport -v ON_ERROR_STOP=1)

echo "==> Чищу докерную БД и заливаю дамп ($DUMP)…"
"${PSQL[@]}" -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'
"${PSQL[@]}" < "$DUMP"

if [ -f deploy/backup/rewrite-screenshots.sql ]; then
  echo "==> Переписываю blob-URL скриншотов на /uploads/…"
  "${PSQL[@]}" < deploy/backup/rewrite-screenshots.sql
fi

echo "==> Поднимаю приложение…"
docker compose up -d --wait app

if [ -d deploy/backup/uploads ] && [ -n "$(ls -A deploy/backup/uploads 2>/dev/null)" ]; then
  echo "==> Копирую скриншоты в том uploads…"
  tar -C deploy/backup/uploads -cf - . \
    | docker compose exec -T -u node app tar -C /app/public/uploads -xf -
fi

"${PSQL[@]}" -c 'SELECT
  (SELECT count(*) FROM "Task")       AS tasks,
  (SELECT count(*) FROM "Screenshot") AS screenshots,
  (SELECT count(*) FROM "Comment")    AS comments,
  (SELECT count(*) FROM "TimeEntry")  AS time_entries;'
echo "✅ Готово: http://localhost:3000"
