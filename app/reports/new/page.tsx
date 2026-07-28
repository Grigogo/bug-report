import type { TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildReport } from "@/app/actions";
import { ReportFilters } from "@/components/ReportFilters";
import { TagChip } from "@/components/TagChip";
import { ToggleAllButton } from "@/components/ToggleAllButton";
import { formatDate } from "@/lib/format";
import { STATUSES, STATUS_BADGE_LABEL, STATUS_META } from "@/lib/status";
import { formatDuration, runningSince, totalSeconds } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function NewReportPage({
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

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Новый отчёт</h1>
      <p className="text-sm text-zinc-500">
        Отфильтруй задачи, отметь галочками нужные и нажми «Построить отчёт» —
        он сохранится на странице «Отчёты».
      </p>

      <ReportFilters
        tags={tags.map((t) => ({ id: t.id, name: t.name }))}
        selectedStatuses={selected}
        selectedTag={tagId ?? ""}
      />

      {selected.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          Отметь хотя бы один статус
        </p>
      ) : rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          Нет задач под выбранные условия
        </p>
      ) : (
        <form action={buildReport} className="space-y-4">
          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  <th className="px-4 py-3">
                    <ToggleAllButton />
                  </th>
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
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        name="task"
                        value={task.id}
                        defaultChecked
                      />
                    </td>
                    <td className="max-w-md px-4 py-3">
                      <span className="font-medium">{task.title}</span>
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
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_META[task.status].badgeCls}`}
                      >
                        {STATUS_BADGE_LABEL[task.status]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {formatDate(task.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                      {isRunning && (
                        <span className="mr-1 text-green-600 dark:text-green-400">⏱</span>
                      )}
                      {formatDuration(seconds)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              name="name"
              maxLength={100}
              placeholder="Название отчёта (необязательно)"
              className="min-w-64 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Построить отчёт
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
