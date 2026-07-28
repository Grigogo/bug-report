export type ReportRow = {
  id: string;
  title: string;
  description: string;
  tags: { name: string; color: string }[];
  statusLabel: string;
  createdAt: string; // ISO
  seconds: number;
};

export type ReportData = {
  rows: ReportRow[];
  totalSeconds: number;
};

export function reportTitle(title: string | null, createdAt: Date): string {
  if (title) return title;
  return `Отчёт от ${new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Kirov",
  }).format(createdAt)}`;
}

// ч:мм:сс — для экспорта в таблицы
export function formatHMS(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
