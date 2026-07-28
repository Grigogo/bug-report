#!/bin/zsh
# Остановка баг-трекера: гасит сервер приложения и Postgres.
# Данные сохраняются в localdb/pgdata — при следующем запуске всё на месте.

PROJECT="$(cd "$(dirname "$0")" && pwd)"
PGBIN="/opt/homebrew/opt/postgresql@17/bin"

echo "==> Останавливаю сервер приложения…"
lsof -ti tcp:3000 | xargs kill 2>/dev/null || true

echo "==> Останавливаю Postgres…"
"$PGBIN/pg_ctl" -D "$PROJECT/localdb/pgdata" stop -m fast 2>/dev/null || true

echo "✅ Остановлено. Данные сохранены."
