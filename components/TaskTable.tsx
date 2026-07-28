import Link from "next/link";
import type { Tag, Task, TaskStatus } from "@prisma/client";
import { moveTask } from "@/app/actions";
import { TagChip } from "@/components/TagChip";
import { formatDate } from "@/lib/format";
import { STATUS_META, TRANSITIONS } from "@/lib/status";

type TaskWithCount = Task & {
  _count: { screenshots: number };
  comments: { isNew: boolean }[];
  tags: Tag[];
};

const primaryBtnCls =
  "rounded-md border border-green-300 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-100 dark:border-green-900 dark:bg-green-950 dark:text-green-400 dark:hover:bg-green-900";
const secondaryBtnCls =
  "rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800";

export function TaskTable({
  tasks,
  status,
}: {
  tasks: TaskWithCount[];
  status: TaskStatus;
}) {
  if (tasks.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        {STATUS_META[status].emptyText}
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
            {status === "DONE" && (
              <th className="px-4 py-3 font-medium">Завершена</th>
            )}
            <th className="px-4 py-3 font-medium">Скрины / 💬</th>
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
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/tasks/${task.id}`}
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {task.title}
                  </Link>
                  {task.tags.map((tag) => (
                    <TagChip key={tag.id} tag={tag} small />
                  ))}
                </div>
                <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {task.description}
                </p>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-400">
                {formatDate(task.createdAt)}
              </td>
              {status === "DONE" && (
                <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-400">
                  {task.completedAt ? formatDate(task.completedAt) : "—"}
                </td>
              )}
              <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-400">
                {task._count.screenshots > 0 && `📎 ${task._count.screenshots} `}
                {task.comments.length > 0 &&
                  (task.comments.some((c) => c.isNew) ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-400">
                      💬 {task.comments.length} нов.
                    </span>
                  ) : (
                    <span>💬 {task.comments.length}</span>
                  ))}
                {task._count.screenshots === 0 && task.comments.length === 0 && "—"}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  {TRANSITIONS[task.status].map((t) => (
                    <form key={t.to} action={moveTask.bind(null, task.id, t.to)}>
                      <button
                        type="submit"
                        className={t.primary ? primaryBtnCls : secondaryBtnCls}
                      >
                        {t.label}
                      </button>
                    </form>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
