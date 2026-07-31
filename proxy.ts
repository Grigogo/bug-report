import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, authEnabled, verifySession } from "@/lib/auth";

// Защита всего сайта: без валидной cookie — на страницу входа.
// Если AUTH_USERS не задан (локальный запуск) — сайт открыт.
export async function proxy(request: NextRequest) {
  if (!authEnabled()) return NextResponse.next();

  const { pathname } = request.nextUrl;
  // /login — сама страница входа; /api/warm — безобидный прогрев базы,
  // пусть срабатывает уже с формы входа
  if (pathname === "/login" || pathname === "/api/warm") {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (await verifySession(token)) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  if (pathname !== "/") url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  // Не трогаем статику Next и локальные скриншоты из public/uploads
  matcher: ["/((?!_next/|favicon\\.ico|uploads/).*)"],
};
