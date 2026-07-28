"use client";

import { usePathname, useRouter } from "next/navigation";
import type { TaskStatus } from "@prisma/client";
import { STATUSES, STATUS_META } from "@/lib/status";

type TagOption = { id: string; name: string };

// Фильтры отчёта: применяются мгновенно при изменении, без кнопки
export function ReportFilters({
  tags,
  selectedStatuses,
  selectedTag,
}: {
  tags: TagOption[];
  selectedStatuses: TaskStatus[];
  selectedTag: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function apply(statuses: TaskStatus[], tag: string) {
    const qs = new URLSearchParams();
    if (statuses.length === 0) {
      qs.set("status", "NONE");
    } else {
      for (const s of statuses) qs.append("status", s);
    }
    if (tag) qs.set("tag", tag);
    router.replace(`${pathname}?${qs.toString()}`);
  }

  function toggleStatus(s: TaskStatus) {
    const next = selectedStatuses.includes(s)
      ? selectedStatuses.filter((x) => x !== s)
      : [...selectedStatuses, s];
    apply(next, selectedTag);
  }

  return (
    <div className="flex flex-wrap items-end gap-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <fieldset className="space-y-1.5">
        <legend className="text-xs font-medium text-zinc-500">Статусы</legend>
        <div className="flex flex-wrap gap-3">
          {STATUSES.map((s) => (
            <label
              key={s}
              className="flex cursor-pointer items-center gap-1.5 text-sm"
            >
              <input
                type="checkbox"
                checked={selectedStatuses.includes(s)}
                onChange={() => toggleStatus(s)}
              />
              {STATUS_META[s].label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="space-y-1.5 text-xs font-medium text-zinc-500">
        Проект (тег)
        <select
          value={selectedTag}
          onChange={(e) => apply(selectedStatuses, e.target.value)}
          className="block rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-normal text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <option value="">Все проекты</option>
          {tags.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
