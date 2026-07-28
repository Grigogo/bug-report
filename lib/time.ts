export type EntryLike = { startedAt: Date; stoppedAt: Date | null };

// Суммарное время по записям, секунды; незакрытая запись считается до `now`
export function totalSeconds(entries: EntryLike[], now = new Date()): number {
  return entries.reduce((sum, e) => {
    const end = e.stoppedAt ?? now;
    return sum + Math.max(0, Math.floor((end.getTime() - e.startedAt.getTime()) / 1000));
  }, 0);
}

export function runningSince(entries: EntryLike[]): Date | null {
  const open = entries.find((e) => e.stoppedAt === null);
  return open ? open.startedAt : null;
}

export function formatDuration(sec: number): string {
  if (sec <= 0) return "—";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h} ч ${String(m).padStart(2, "0")} м`;
  if (m > 0) return `${m} м ${String(s).padStart(2, "0")} с`;
  return `${s} с`;
}
