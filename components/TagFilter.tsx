import Link from "next/link";
import type { Tag } from "@prisma/client";
import { tagColor } from "@/lib/tags";

export function TagFilter({
  tags,
  activeTagId,
  path,
}: {
  tags: Tag[];
  activeTagId?: string;
  path: string;
}) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-xs text-zinc-500">Фильтр:</span>
      <Link
        href={path}
        className={`rounded-full px-3 py-1 text-xs font-medium ${
          !activeTagId
            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
        }`}
      >
        Все
      </Link>
      {tags.map((tag) => {
        const active = tag.id === activeTagId;
        return (
          <Link
            key={tag.id}
            href={`${path}?tag=${tag.id}`}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              active
                ? `${tagColor(tag.color).chip} ring-2 ring-current`
                : `${tagColor(tag.color).chip} opacity-70 hover:opacity-100`
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${tagColor(tag.color).dot}`} />
            {tag.name}
          </Link>
        );
      })}
    </div>
  );
}
