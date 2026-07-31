"use client";

import { useActionState } from "react";
import { login } from "@/app/login/actions";

const inputCls =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, null);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      <div className="space-y-1.5">
        <label htmlFor="login" className="block text-sm font-medium">
          Логин
        </label>
        <input
          id="login"
          name="login"
          required
          autoFocus
          autoComplete="username"
          className={inputCls}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium">
          Пароль
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputCls}
        />
      </div>

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Входим…" : "Войти"}
      </button>
    </form>
  );
}
