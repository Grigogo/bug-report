# Развёртывание на своей ВМ — пошагово

Дамп прода уже снят и лежит в `deploy/backup/` на маке (в git не попадает).
Команды «на маке» выполняются в терминале в `~/Projects/bug-report`,
команды «на ВМ» — по SSH. `USER@VM` замени на свои логин и адрес ВМ.

## Шаг 0. Что нужно

- ВМ: Ubuntu 22.04+ / Debian 12+, от 1 ГБ RAM, публичный IPv4,
  открыты порты 22, 80, 443 (в файрволе/панели облака).
- Доступ к DNS-зоне grigogo.ru.

## Шаг 1. DNS

Создай A-запись: имя `bug-repor` (если хочешь `bug-report` — тогда везде ниже
и в `.env` пиши его), значение — IP ВМ.

Проверка с мака (должен вернуться IP ВМ):

```bash
dig +short bug-repor.grigogo.ru
```

## Шаг 2. Docker на ВМ

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # выйти и зайти по SSH заново
docker ps                        # должно ответить без sudo
```

Если `docker pull` упирается в блокировку Docker Hub (РФ):

```bash
sudo tee /etc/docker/daemon.json <<'EOF'
{"registry-mirrors": ["https://mirror.gcr.io", "https://huecker.io"]}
EOF
sudo systemctl restart docker
```

## Шаг 3. Перенос проекта (на маке)

Копирует код и дамп с данными одной командой (git-доступ на ВМ не нужен):

```bash
rsync -az --exclude node_modules --exclude .next --exclude localdb \
  --exclude .git --exclude .env \
  ~/Projects/bug-report/ USER@VM:~/bug-report/
```

## Шаг 4. Настройки на ВМ

```bash
cd ~/bug-report
cat > .env <<EOF
POSTGRES_PASSWORD="$(openssl rand -hex 16)"
AUTH_USERS="логин:пароль,логин2:пароль2"
SITE_DOMAIN="bug-repor.grigogo.ru"
EOF
chmod 600 .env
```

`AUTH_USERS` — те же логины/пароли, что стоят на Vercel (или новые).

## Шаг 5. Запуск

```bash
docker compose --profile prod up -d --build
```

Первая сборка — минут 5. Проверка: `docker compose ps` — три контейнера
(app, db, caddy), у app и db статус healthy.

## Шаг 6. Заливка данных

```bash
deploy/restore-into-docker.sh
```

В конце скрипт печатает счётчики задач/скриншотов — сверь, что не нули.

## Шаг 7. Проверка

Открой https://bug-repor.grigogo.ru — должна быть форма входа (сертификат
caddy получает сам, первые секунды может отдавать ошибку — обнови страницу).
Войди, проверь: список задач, карточку со скриншотами, таймер, отчёты,
создание тестовой задачи со скриншотом (потом удали).

## Шаг 8. Финальное переключение

Пока ты проверял, на Vercel могли добавиться новые задачи. Перед тем как
объявить переезд состоявшимся:

```bash
# на маке — свежий дамп и доливка на ВМ:
NEON_DATABASE_URL='postgresql://…прямой-хост-без--pooler…' \
BLOB_READ_WRITE_TOKEN='vercel_blob_rw_…' deploy/dump-prod.sh
rsync -az deploy/backup/ USER@VM:~/bug-report/deploy/backup/
ssh USER@VM 'cd ~/bug-report && deploy/restore-into-docker.sh'
```

После этого работайте только на ВМ. Vercel-проект можно оставить как есть
(он ничего не стоит) или удалить вместе с Neon/Blob. Учти: строка Neon и
Blob-токен фигурировали в переписке — если Vercel остаётся жить, лучше
пересоздать пароль в Neon и токен Blob.

## Эксплуатация

Обновление кода: на маке `rsync` из шага 3, затем на ВМ
`docker compose --profile prod up -d --build`.

Бэкап (на ВМ, класть куда-то вне ВМ):

```bash
cd ~/bug-report
docker compose exec -T db pg_dump -U bugreport bugreport | gzip > backup-$(date +%F).sql.gz
docker compose cp app:/app/public/uploads ./uploads-backup
```

Автобэкап раз в сутки: `crontab -e` →

```
0 3 * * * cd $HOME/bug-report && docker compose exec -T db pg_dump -U bugreport bugreport | gzip > $HOME/backup-bugreport-$(date +\%F).sql.gz
```

## Если что-то не так

- **Сертификат не выдаётся** — DNS ещё не разъехался (`dig +short домен`
  с ВМ должен вернуть её же IP) или закрыт порт 80.
- **Образы не тянутся** — зеркала из шага 2.
- **Сайт открыт без пароля** — в `.env` пуст `AUTH_USERS`; задай и
  `docker compose --profile prod up -d app`.
- Логи: `docker compose logs app --tail 50`, `docker compose logs caddy --tail 50`.
