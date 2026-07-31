import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { logout } from "@/app/login/actions";
import { NavTabs } from "@/components/NavTabs";
import { Warmup } from "@/components/Warmup";
import { SESSION_COOKIE, authEnabled, verifySession } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Баг-трекер",
  description: "Баг-репорты от тестировщика",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = authEnabled()
    ? await verifySession((await cookies()).get(SESSION_COOKIE)?.value)
    : null;

  return (
    <html lang="ru">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
        <Warmup />
        <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <NavTabs />
            <div className="flex items-center gap-2">
              <Link
                href="/reports"
                className="rounded-md px-2 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                title="Отчёт по времени"
              >
                📊
              </Link>
              <Link
                href="/tags"
                className="rounded-md px-2 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                title="Управление тегами"
              >
                🏷️
              </Link>
              <Link
                href="/new"
                className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                + Новый баг
              </Link>
              {user && (
                <form action={logout}>
                  <button
                    type="submit"
                    title={`Выйти (${user})`}
                    className="rounded-md px-2 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  >
                    ⎋
                  </button>
                </form>
              )}
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 pb-4 text-right text-[11px] text-zinc-400 dark:text-zinc-600">
          сборка{" "}
          {process.env.VERCEL_GIT_COMMIT_SHA
            ? `${process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)} · `
            : ""}
          {new Date(process.env.NEXT_PUBLIC_BUILD_AT ?? 0).toLocaleString("ru-RU", {
            timeZone: "Europe/Kirov",
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </footer>
      </body>
    </html>
  );
}
