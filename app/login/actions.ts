"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  authEnabled,
  checkCredentials,
  createSession,
} from "@/lib/auth";

export async function login(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string }> {
  if (!authEnabled()) redirect("/");

  const loginName = String(formData.get("login") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (!checkCredentials(loginName, password)) {
    return { error: "Неверный логин или пароль" };
  }

  const { token, maxAge } = await createSession(loginName);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    // Локальный запуск ходит по http — там secure-cookie не установится
    secure: Boolean(process.env.VERCEL),
    maxAge,
    path: "/",
  });

  // Защита от open redirect: только внутренние пути
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
