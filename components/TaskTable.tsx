import Link from "next/link";
import type { Task } from "@prisma/client";
import { completeTask, reopenTask } from "@/app/actions";
import { formatDate } from "@/lib/format";

type TaskWithCount = Task & { _count: { screenshots: number } };

export function TaskTable({
  tasks,
  variant,
}: {
  tasks: TaskWithCount[];
  variant: "open" | "done";
}) {
  if (tasks.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        {variant === "open"
          ? "Активных задач нет — можно отдыхать 🎉"
          : "Завершённых задач пока нет"}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <th className="px-4 py-3 font-medium">Задача</th>
            <th className="px-4 py-3 font-medium">Создана</th>
            {variant === "done" && (
              <th className="px-4 py-3 font-medium">Завершена</th>
            )}
            <th className="px-4 py-3 font-medium">Скрины</th>
            <th className="px-4 py-3 font-medium text-right">Действие</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-800/50"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/tasks/${task.id}`}
                  className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  {task.title}
                </Link>
                <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {task.description}
                </p>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-400">
                {formatDate(task.createdAt)}
              </td>
              {variant === "done" && (
                <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-400">
                  {task.completedAt ? formatDate(task.completedAt) : "—"}
                </td>
              )}
              <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                {task._count.screenshots > 0 ? `📎 ${task._count.screenshots}` : "—"}
              </td>
              <td className="px-4 py-3 text-right">
                {variant === "open" ? (
                  <form action={completeTask.bind(null, task.id)}>
                    <button
                      type="submit"
                      className="rounded-md border border-green-300 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-100 dark:border-green-900 dark:bg-green-950 dark:text-green-400 dark:hover:bg-green-900"
                    >
                      Готово ✓
                    </button>
                  </form>
                ) : (
                  <form action={reopenTask.bind(null, task.id)}>
                    <button
                      type="submit"
                      className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Вернуть в работу
                    </button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
