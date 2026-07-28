import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { moveTask } from "@/app/actions";
import { Comments } from "@/components/Comments";
import { DeleteButton } from "@/components/DeleteButton";
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
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      screenshots: true,
      comments: { orderBy: { createdAt: "asc" } },
    },
  });

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
              screenshots={task.screenshots.map((s) => ({ id: s.id, url: s.url }))}
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
