import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { completeTask, reopenTask } from "@/app/actions";
import { DeleteButton } from "@/components/DeleteButton";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = await prisma.task.findUnique({
    where: { id },
    include: { screenshots: true },
  });

  if (!task) notFound();

  const isOpen = task.status === "OPEN";

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        href={isOpen ? "/" : "/done"}
        className="text-sm text-zinc-500 hover:underline"
      >
        ← Назад к списку
      </Link>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-semibold">{task.title}</h1>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
              isOpen
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400"
                : "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400"
            }`}
          >
            {isOpen ? "В работе" : "Завершена"}
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {task.screenshots.map((shot) => (
                <a
                  key={shot.id}
                  href={shot.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block overflow-hidden rounded-md border border-zinc-200 hover:opacity-90 dark:border-zinc-700"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shot.url}
                    alt="Скриншот ошибки"
                    className="aspect-video w-full object-cover"
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
          </section>
        )}

        <div className="mt-6 flex items-center gap-3 border-t border-zinc-100 pt-5 dark:border-zinc-800">
          {isOpen ? (
            <form action={completeTask.bind(null, task.id)}>
              <button
                type="submit"
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Исправлено ✓
              </button>
            </form>
          ) : (
            <form action={reopenTask.bind(null, task.id)}>
              <button
                type="submit"
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Вернуть в работу
              </button>
            </form>
          )}
          <DeleteButton taskId={task.id} />
        </div>
      </div>
    </div>
  );
}
