"use client";

import { useEffect, useState } from "react";
import { formatDuration } from "@/lib/time";

// Показывает накопленное время; если таймер запущен (runningSince задан) —
// тикает раз в секунду
export function TimerTicker({
  baseSeconds,
  runningSince,
}: {
  baseSeconds: number;
  runningSince: string | null;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!runningSince) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [runningSince]);

  const running = runningSince
    ? Math.max(0, Math.floor((now - new Date(runningSince).getTime()) / 1000))
    : 0;
  const total = baseSeconds + running;

  return (
    <span
      suppressHydrationWarning
      className={
        runningSince
          ? "font-medium text-green-600 dark:text-green-400"
          : undefined
      }
    >
      {runningSince && "⏱ "}
      {total > 0 ? formatDuration(total) : runningSince ? "0 с" : "—"}
    </span>
  );
}
