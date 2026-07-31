import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { SESSION_COOKIE, authEnabled, verifySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (!authEnabled()) redirect("/");

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (await verifySession(token)) redirect("/");

  const { next } = await searchParams;

  return (
    <div className="mx-auto mt-16 max-w-sm space-y-5">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold">Баг-трекер</h1>
        <p className="text-sm text-zinc-500">Вход только для своих</p>
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <LoginForm next={next ?? "/"} />
      </div>
    </div>
  );
}
