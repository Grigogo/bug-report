"use client";

import { useTransition } from "react";
import { deleteTask } from "@/app/actions";

export function DeleteButton({ taskId }: { taskId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Удалить задачу навсегда? Скриншоты тоже будут удалены.")) return;
        startTransition(() => deleteTask(taskId));
      }}
      className="ml-auto rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950"
    >
      {pending ? "Удаление…" : "Удалить"}
    </button>
  );
}
