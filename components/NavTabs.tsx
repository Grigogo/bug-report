"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { STATUSES, STATUS_META } from "@/lib/status";

const ICONS: Record<string, string> = {
  NEW: "🆕",
  IN_PROGRESS: "🔧",
  REVIEW: "👀",
  DONE: "✅",
};

export function NavTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 overflow-x-auto text-sm font-medium">
      {STATUSES.map((s) => {
        const meta = STATUS_META[s];
        const active = pathname === meta.path;
        return (
          <Link
            key={s}
            href={meta.path}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 ${
              active
                ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            {ICONS[s]} {meta.label}
          </Link>
        );
      })}
    </nav>
  );
}
