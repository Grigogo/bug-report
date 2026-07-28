#!/bin/zsh
# Запуск баг-трекера: двойной клик по этому файлу в Finder.
# Поднимает Postgres (данные в localdb/pgdata) и сервер приложения на порту 3000.
set -e

PROJECT="$(cd "$(dirname "$0")" && pwd)"
PGBIN="/opt/homebrew/opt/postgresql@17/bin"
PGDATA="$PROJECT/localdb/pgdata"
PGPORT=54329
APPPORT=3000

cd "$PROJECT"
mkdir -p localdb

echo "==> Postgres…"
if ! "$PGBIN/pg_isready" -h 127.0.0.1 -p $PGPORT -q; then
  "$PGBIN/pg_ctl" -D "$PGDATA" \
    -o "-p $PGPORT -c unix_socket_directories=''" \
    -l "$PROJECT/localdb/postgres.log" start
fi
for i in {1..30}; do
  "$PGBIN/pg_isready" -h 127.0.0.1 -p $PGPORT -q && break
  sleep 1
done
echo "    Postgres работает (порт $PGPORT)"

# Пересобираем приложение, только если код менялся после последней сборки
if [ ! -f .next/BUILD_ID ] || \
   [ -n "$(find app components lib prisma package.json next.config.ts -newer .next/BUILD_ID 2>/dev/null | head -1)" ]; then
  echo "==> Сборка приложения (код обновился)…"
  npm run build
fi

echo "==> Запуск сервера…"
lsof -ti tcp:$APPPORT | xargs kill 2>/dev/null || true
sleep 1
nohup npx next start -H 0.0.0.0 -p $APPPORT > "$PROJECT/localdb/app.log" 2>&1 &

for i in {1..30}; do
  curl -s -o /dev/null "http://127.0.0.1:$APPPORT/" && break
  sleep 1
done

LAN_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "?")
echo ""
echo "✅ Готово!"
echo "   На этом компьютере:  http://localhost:$APPPORT"
echo "   Для тестировщика:    http://$LAN_IP:$APPPORT"
echo ""
open "http://localhost:$APPPORT"
