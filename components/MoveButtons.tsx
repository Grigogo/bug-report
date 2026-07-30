"use client";

import { useTransition } from "react";
import type { TaskStatus } from "@prisma/client";
import { moveTask } from "@/app/actions";
import { TRANSITIONS } from "@/lib/status";

const VARIANTS = {
  table: {
    primary:
      "rounded-md border border-green-300 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-100 dark:border-green-900 dark:bg-green-950 dark:text-green-400 dark:hover:bg-green-900",
    secondary:
      "rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800",
  },
  detail: {
    primary:
      "rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700",
    secondary:
      "rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800",
  },
} as const;

export function MoveButtons({
  taskId,
  status,
  variant,
  onMoveStart,
}: {
  taskId: string;
  status: TaskStatus;
  variant: keyof typeof VARIANTS;
  onMoveStart?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const cls = VARIANTS[variant];

  function move(to: TaskStatus) {
    startTransition(async () => {
      onMoveStart?.();
      try {
        await moveTask(taskId, to);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Не удалось перевести задачу");
      }
    });
  }

  return (
    <>
      {TRANSITIONS[status].map((t) => (
        <button
          key={t.to}
          type="button"
          disabled={pending}
          onClick={() => move(t.to)}
          className={`${t.primary ? cls.primary : cls.secondary} disabled:opacity-50`}
        >
          {pending ? "⏳ " : ""}
          {t.label}
        </button>
      ))}
    </>
  );
}
