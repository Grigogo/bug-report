# Перенос баг-трекера на свою ВМ

Стек в Docker: Next.js (standalone) + Postgres 17 + том для скриншотов + caddy (TLS).

## 1. Дамп прода (на рабочем маке, прод не трогает)

```bash
NEON_DATABASE_URL="postgresql://…"   # Vercel → Storage → Neon → Connection string (или Neon Console)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_…"  # Vercel → Storage → Blob → Tokens
NEON_DATABASE_URL=… BLOB_READ_WRITE_TOKEN=… deploy/dump-prod.sh
```

Результат в `deploy/backup/` (в git не попадает): `neon-<дата>.sql`, `uploads/`,
`rewrite-screenshots.sql`.

## 2. Локальная проверка в Docker

```bash
docker compose up -d --build      # пустая БД со схемой
deploy/restore-into-docker.sh     # залить дамп + скриншоты, переписать URL
open http://localhost:3000
```

## 3. ВМ

DNS: A-запись `bug-repor.grigogo.ru` → IP ВМ (порты 80/443 открыты).

```bash
# на ВМ (нужен docker + docker compose plugin)
git clone https://github.com/Grigogo/bug-report.git && cd bug-report
cat > .env <<'EOF'
POSTGRES_PASSWORD="…"                 # придумать
AUTH_USERS="логин:пароль,логин2:пароль2"
SITE_DOMAIN="bug-repor.grigogo.ru"
EOF
docker compose --profile prod up -d --build
```

Перенос данных с мака на ВМ:

```bash
rsync -az deploy/backup/ пользователь@вм:~/bug-report/deploy/backup/
ssh пользователь@вм 'cd bug-report && deploy/restore-into-docker.sh'
```

Если Docker Hub с ВМ недоступен (РФ) — прописать зеркало в `/etc/docker/daemon.json`:
`{"registry-mirrors": ["https://mirror.gcr.io", "https://huecker.io"]}` и перезапустить docker.

## Обновления кода

```bash
git pull && docker compose --profile prod up -d --build
```

## Бэкап с ВМ

```bash
docker compose exec -T db pg_dump -U bugreport bugreport > backup-$(date +%F).sql
docker compose cp app:/app/public/uploads ./uploads-backup
```
