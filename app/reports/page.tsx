import Link from "next/link";
import type { TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ReportFilters } from "@/components/ReportFilters";
import { TagChip } from "@/components/TagChip";
import { formatDate } from "@/lib/format";
import { STATUSES, STATUS_BADGE_LABEL, STATUS_META } from "@/lib/status";
import { formatDuration, runningSince, totalSeconds } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[]; tag?: string }>;
}) {
  const params = await searchParams;
  const explicit = params.status !== undefined;
  const rawStatuses = Array.isArray(params.status)
    ? params.status
    : params.status
      ? [params.status]
      : [];
  const selected = explicit
    ? STATUSES.filter((s) => rawStatuses.includes(s))
    : (["IN_PROGRESS", "DONE"] as TaskStatus[]);
  const tagId = params.tag || undefined;

  const [tasks, tags] = await Promise.all([
    prisma.task.findMany({
      where: {
        status: { in: selected },
        ...(tagId ? { tags: { some: { id: tagId } } } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        tags: true,
        timeEntries: { select: { startedAt: true, stoppedAt: true } },
      },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  const now = new Date();
  const rows = tasks
    .map((t) => ({
      task: t,
      seconds: totalSeconds(t.timeEntries, now),
      isRunning: runningSince(t.timeEntries) !== null,
    }))
    .sort((a, b) => b.seconds - a.seconds);
  const grandTotal = rows.reduce((sum, r) => sum + r.seconds, 0);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Отчёт по времени</h1>

      <ReportFilters
        tags={tags.map((t) => ({ id: t.id, name: t.name }))}
        selectedStatuses={selected}
        selectedTag={tagId ?? ""}
      />

      <div className="flex flex-wrap gap-3">
        <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Задач</p>
          <p className="text-lg font-semibold tabular-nums">{rows.length}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Всего времени</p>
          <p className="text-lg font-semibold tabular-nums">
            {formatDuration(grandTotal)}
          </p>
        </div>
      </div>

      {selected.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          Отметь хотя бы один статус
        </p>
      ) : rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          Нет задач под выбранные условия
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="px-4 py-3 font-medium">Задача</th>
                <th className="px-4 py-3 font-medium">Проект</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium">Создана</th>
                <th className="px-4 py-3 text-right font-medium">Время</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ task, seconds, isRunning }) => (
                <tr
                  key={task.id}
                  className="border-b border-zinc-100 align-top last:border-0 dark:border-zinc-800/50"
                >
                  <td className="max-w-md px-4 py-3">
                    <Link
                      href={`/tasks/${task.id}`}
                      className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {task.title}
                    </Link>
                    <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                      {task.description}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {task.tags.length > 0
                        ? task.tags.map((tag) => (
                            <TagChip key={tag.id} tag={tag} small />
                          ))
                        : "—"}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_META[task.status as TaskStatus].badgeCls}`}
                    >
                      {STATUS_BADGE_LABEL[task.status as TaskStatus]}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-400">
                    {formatDate(task.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums">
                    {isRunning && (
                      <span className="mr-1 text-green-600 dark:text-green-400">⏱</span>
                    )}
                    {formatDuration(seconds)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                <td className="px-4 py-3 font-semibold" colSpan={4}>
                  Итого ({rows.length}{" "}
                  {rows.length === 1 ? "задача" : rows.length < 5 ? "задачи" : "задач"})
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums">
                  {formatDuration(grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <p className="text-xs text-zinc-500">
        ⏱ — таймер сейчас запущен, его время учтено на момент построения отчёта.
      </p>
    </div>
  );
}
