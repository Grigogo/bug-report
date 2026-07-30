"use client";

import { useOptimistic } from "react";
import Link from "next/link";
import type { Tag, Task, TaskStatus, TimeEntry } from "@prisma/client";
import { MoveButtons } from "@/components/MoveButtons";
import { TagChip } from "@/components/TagChip";
import { TimerControls } from "@/components/TimerControls";
import { TimerTicker } from "@/components/TimerTicker";
import { formatDate } from "@/lib/format";
import { STATUS_META } from "@/lib/status";
import { runningSince, totalSeconds } from "@/lib/time";

type TaskWithCount = Task & {
  _count: { screenshots: number };
  comments: { isNew: boolean }[];
  tags: Tag[];
  timeEntries: Pick<TimeEntry, "startedAt" | "stoppedAt">[];
};

export function TaskTable({
  tasks,
  status,
}: {
  tasks: TaskWithCount[];
  status: TaskStatus;
}) {
  // Строка исчезает сразу по клику, не дожидаясь ответа сервера;
  // при ошибке действия React сам вернёт её на место
  const [visibleTasks, hideTask] = useOptimistic(
    tasks,
    (state, id: string) => state.filter((t) => t.id !== id),
  );

  if (visibleTasks.length === 0) {
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
            {(status === "IN_PROGRESS" || status === "DONE") && (
              <th className="px-4 py-3 font-medium">Время</th>
            )}
            <th className="px-4 py-3 font-medium text-right">Действие</th>
          </tr>
        </thead>
        <tbody>
          {visibleTasks.map((task) => (
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
                  {task.editedAt && (
                    <span
                      title={`Отредактирована ${formatDate(task.editedAt)}`}
                      className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-400"
                    >
                      ✏️ правлена
                    </span>
                  )}
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
              {(status === "IN_PROGRESS" || status === "DONE") && (
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-2">
                    <TimerTicker
                      baseSeconds={totalSeconds(
                        task.timeEntries.filter((e) => e.stoppedAt !== null),
                      )}
                      runningSince={
                        runningSince(task.timeEntries)?.toISOString() ?? null
                      }
                    />
                    {status === "IN_PROGRESS" && (
                      <TimerControls
                        taskId={task.id}
                        isRunning={runningSince(task.timeEntries) !== null}
                        compact
                      />
                    )}
                  </div>
                </td>
              )}
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <MoveButtons
                    taskId={task.id}
                    status={task.status}
                    variant="table"
                    onMoveStart={() => hideTask(task.id)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
