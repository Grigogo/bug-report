import type { Comment } from "@prisma/client";
import { addComment } from "@/app/actions";
import { formatDate } from "@/lib/format";

export function Comments({
  taskId,
  comments,
}: {
  taskId: string;
  comments: Comment[];
}) {
  const newCount = comments.filter((c) => c.isNew).length;

  return (
    <section className="mt-5 space-y-3">
      <h2 className="text-sm font-medium text-zinc-500">
        Комментарии {comments.length > 0 && `(${comments.length})`}
        {newCount > 0 && (
          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-400">
            {newCount} нов.
          </span>
        )}
      </h2>

      {comments.length > 0 && (
        <ul className="space-y-2">
          {comments.map((c) => (
            <li
              key={c.id}
              className={`rounded-md border p-3 text-sm ${
                c.isNew
                  ? "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40"
                  : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50"
              }`}
            >
              <div className="mb-1 flex items-center gap-2 text-xs text-zinc-500">
                {formatDate(c.createdAt)}
                {c.isNew && (
                  <span className="rounded-full bg-amber-500 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-white">
                    новый
                  </span>
                )}
              </div>
              <p className="whitespace-pre-wrap leading-relaxed">{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      <form action={addComment.bind(null, taskId)} className="space-y-2">
        <textarea
          name="body"
          required
          rows={3}
          placeholder="Например: после исправления кнопка всё ещё не работает на iOS…"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Добавить комментарий
        </button>
      </form>
    </section>
  );
}
