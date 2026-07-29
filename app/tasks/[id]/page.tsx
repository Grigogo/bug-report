import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { moveTask, setTaskTags } from "@/app/actions";
import { Comments } from "@/components/Comments";
import { DeleteButton } from "@/components/DeleteButton";
import { TagChip } from "@/components/TagChip";
import { TimerControls } from "@/components/TimerControls";
import { TimerTicker } from "@/components/TimerTicker";
import { screenshotSrc } from "@/lib/screenshot";
import { runningSince, totalSeconds } from "@/lib/time";
import { ScreenshotGallery } from "@/components/ScreenshotGallery";
import { formatDate } from "@/lib/format";
import { STATUS_BADGE_LABEL, STATUS_META, TRANSITIONS } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [task, allTags] = await Promise.all([
    prisma.task.findUnique({
      where: { id },
      include: {
        screenshots: true,
        comments: { orderBy: { createdAt: "asc" } },
        tags: true,
        timeEntries: true,
      },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!task) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        href={STATUS_META[task.status].path}
        className="text-sm text-zinc-500 hover:underline"
      >
        ← Назад к списку
      </Link>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-semibold">{task.title}</h1>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${STATUS_META[task.status].badgeCls}`}
          >
            {STATUS_BADGE_LABEL[task.status]}
          </span>
        </div>

        <p className="mt-1 text-xs text-zinc-500">
          Создана {formatDate(task.createdAt)}
          {task.completedAt && ` · завершена ${formatDate(task.completedAt)}`}
        </p>

        {allTags.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {task.tags.map((tag) => (
              <TagChip key={tag.id} tag={tag} />
            ))}
            <details className="relative">
              <summary className="cursor-pointer list-none text-xs text-zinc-500 hover:text-zinc-900 hover:underline dark:hover:text-zinc-100">
                {task.tags.length > 0 ? "изменить теги" : "+ добавить теги"}
              </summary>
              <form
                action={setTaskTags.bind(null, task.id)}
                className="absolute left-0 top-6 z-10 w-56 space-y-2 rounded-md border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
              >
                {allTags.map((tag) => (
                  <label key={tag.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="tags"
                      value={tag.id}
                      defaultChecked={task.tags.some((t) => t.id === tag.id)}
                    />
                    <TagChip tag={tag} />
                  </label>
                ))}
                <button
                  type="submit"
                  className="w-full rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Сохранить
                </button>
              </form>
            </details>
          </div>
        )}

        {(task.status === "IN_PROGRESS" || task.timeEntries.length > 0) && (
          <div className="mt-4 flex items-center gap-3 rounded-md bg-zinc-50 px-4 py-3 dark:bg-zinc-800/50">
            <span className="text-sm text-zinc-500">Затрачено:</span>
            <span className="text-sm">
              <TimerTicker
                baseSeconds={totalSeconds(
                  task.timeEntries.filter((e) => e.stoppedAt !== null),
                )}
                runningSince={runningSince(task.timeEntries)?.toISOString() ?? null}
              />
            </span>
            {task.status === "IN_PROGRESS" && (
              <TimerControls
                taskId={task.id}
                isRunning={runningSince(task.timeEntries) !== null}
                compact
              />
            )}
          </div>
        )}

        <section className="mt-5 space-y-1">
          <h2 className="text-sm font-medium text-zinc-500">Описание</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {task.description}
          </p>
        </section>

        {task.steps && (
          <section className="mt-5 space-y-1">
            <h2 className="text-sm font-medium text-zinc-500">
              Шаги воспроизведения
            </h2>
            <p className="whitespace-pre-wrap rounded-md bg-zinc-50 p-3 text-sm leading-relaxed dark:bg-zinc-800/50">
              {task.steps}
            </p>
          </section>
        )}

        {task.screenshots.length > 0 && (
          <section className="mt-5 space-y-2">
            <h2 className="text-sm font-medium text-zinc-500">
              Скриншоты ({task.screenshots.length})
            </h2>
            <ScreenshotGallery
              screenshots={task.screenshots.map((s) => ({
                id: s.id,
                url: screenshotSrc(s.url),
              }))}
            />
          </section>
        )}

        <Comments taskId={task.id} comments={task.comments} />

        <div className="mt-6 flex items-center gap-3 border-t border-zinc-100 pt-5 dark:border-zinc-800">
          {TRANSITIONS[task.status].map((t) => (
            <form key={t.to} action={moveTask.bind(null, task.id, t.to)}>
              <button
                type="submit"
                className={
                  t.primary
                    ? "rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                    : "rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                }
              >
                {t.label}
              </button>
            </form>
          ))}
          <DeleteButton taskId={task.id} />
        </div>
      </div>
    </div>
  );
}
