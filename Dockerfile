# syntax=docker/dockerfile:1

# === STAGE 1: Build ===
FROM node:24-alpine AS builder
WORKDIR /app

# postinstall запускает prisma generate — схема нужна уже на npm ci
COPY package*.json ./
COPY prisma ./prisma
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1 DOCKER_BUILD=1
# Заглушка: страницы динамические, при сборке к БД никто не ходит
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
RUN npm run build

# === STAGE 2: Production runtime ===
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# libssl нужен движку Prisma (в alpine-образе node его может не быть)
RUN apk add --no-cache libssl3

# standalone уже содержит server.js и только нужные node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Каталог скриншотов: сюда монтируется том, владелец — node
RUN mkdir -p public/uploads && chown -R node:node public/uploads

USER node
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
