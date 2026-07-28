import { prisma } from "@/lib/prisma";
import { createTag, deleteTag } from "@/app/actions";
import { TagChip } from "@/components/TagChip";
import { TAG_COLORS } from "@/lib/tags";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { tasks: true } } },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-xl font-semibold">Теги</h1>

      <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        {tags.length === 0 ? (
          <p className="text-sm text-zinc-500">Тегов пока нет — добавь первый ниже.</p>
        ) : (
          <ul className="space-y-2">
            {tags.map((tag) => (
              <li key={tag.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <TagChip tag={tag} />
                  <span className="text-xs text-zinc-500">
                    {tag._count.tasks > 0 ? `задач: ${tag._count.tasks}` : "не используется"}
                  </span>
                </div>
                <form action={deleteTag.bind(null, tag.id)}>
                  <button
                    type="submit"
                    className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    Удалить
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form
        action={createTag}
        className="space-y-3 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h2 className="text-sm font-medium">Новый тег</h2>
        <div className="flex flex-wrap gap-3">
          <input
            name="name"
            required
            maxLength={50}
            placeholder="Название (например, Глобус Про)"
            className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <select
            name="color"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {Object.entries(TAG_COLORS).map(([key, c]) => (
              <option key={key} value={key}>
                {c.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Добавить
          </button>
        </div>
        <p className="text-xs text-zinc-500">
          Удаление тега не удаляет задачи — он просто снимается с них.
        </p>
      </form>
    </div>
  );
}
