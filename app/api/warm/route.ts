import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Прогрев: Neon на бесплатном тарифе засыпает после простоя и просыпается
// несколько секунд. Клиент дёргает этот эндпоинт при открытии вкладки,
// чтобы к первому клику пользователя база уже была тёплой.
export async function GET() {
  const t0 = performance.now();
  await prisma.$queryRaw`SELECT 1`;
  const dbMs = Math.round(performance.now() - t0);

  // Регион базы (не секрет) — чтобы сверить с регионом функции Vercel
  const host =
    (process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "").match(
      /@([^/?:]+)/,
    )?.[1] ?? null;
  const dbRegion = host?.match(/\.([a-z]{2}-[a-z]+-\d)\./)?.[1] ?? null;

  return NextResponse.json({ ok: true, dbMs, dbRegion });
}
