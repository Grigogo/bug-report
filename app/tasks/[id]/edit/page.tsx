import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateTask } from "@/app/actions";
import { TagChip } from "@/components/TagChip";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const inputCls =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [task, allTags] = await Promise.all([
    prisma.task.findUnique({ where: { id }, include: { tags: true } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!task) notFound();
  // Готовые задачи не редактируются — сначала «Вернуть в работу»
  if (task.status === "DONE") redirect(`/tasks/${id}`);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        href={`/tasks/${task.id}`}
        className="text-sm text-zinc-500 hover:underline"
      >
        ← Назад к задаче
      </Link>

      <form
        action={updateTask.bind(null, task.id)}
        className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div>
          <h1 className="text-lg font-semibold">Редактирование задачи</h1>
          <p className="mt-0.5 text-xs text-zinc-500">
            Создана {formatDate(task.createdAt)}
            {task.editedAt && ` · правлена ${formatDate(task.editedAt)}`}
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="title" className="block text-sm font-medium">
            Название <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            required
            maxLength={200}
            defaultValue={task.title}
            className={inputCls}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="description" className="block text-sm font-medium">
            Описание <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            defaultValue={task.description}
            className={inputCls}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="steps" className="block text-sm font-medium">
            Шаги воспроизведения{" "}
            <span className="text-xs font-normal text-zinc-500">
              (необязательно)
            </span>
          </label>
          <textarea
            id="steps"
            name="steps"
            rows={4}
            defaultValue={task.steps ?? ""}
            className={inputCls}
          />
        </div>

        {allTags.length > 0 && (
          <div className="space-y-1.5">
            <span className="block text-sm font-medium">Проект / теги</span>
            <div className="flex flex-wrap gap-3">
              {allTags.map((tag) => (
                <label key={tag.id} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    name="tags"
                    value={tag.id}
                    defaultChecked={task.tags.some((t) => t.id === tag.id)}
                  />
                  <TagChip tag={tag} />
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Сохранить изменения
          </button>
          <Link
            href={`/tasks/${task.id}`}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
}
