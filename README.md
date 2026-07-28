# Баг-трекер

Мини-приложение для баг-репортов: тестировщик создаёт задачу (название, описание, шаги воспроизведения, скриншоты), разработчик видит их в таблице на главной и помечает исправленные — они уходят на страницу «Завершённые».

Стек: Next.js (App Router) · Prisma · Postgres (Neon) · Vercel Blob.

## Страницы

- `/` — таблица активных задач
- `/new` — форма создания баг-репорта
- `/done` — завершённые задачи
- `/tasks/[id]` — карточка задачи (описание, шаги, скриншоты, действия)

## Деплой на Vercel

1. `npx vercel login`, затем `npx vercel link` (создать проект).
2. В дашборде проекта: **Storage → Create Database → Neon (Postgres)** — переменная `DATABASE_URL` добавится автоматически.
3. Там же: **Storage → Create Blob Store** — добавится `BLOB_READ_WRITE_TOKEN`.
4. Локально: `npx vercel env pull .env` — подтянуть переменные.
5. Применить схему БД: `npx prisma db push`.
6. `npx vercel --prod` — деплой.

## Локальная разработка

```bash
npm install
# заполнить .env (см. .env.example) или npx vercel env pull .env
npx prisma db push
npm run dev
```

Загрузка скриншотов работает только с настоящим `BLOB_READ_WRITE_TOKEN` (создание задач без скриншотов работает и без него).
