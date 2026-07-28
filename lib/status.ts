import type { TaskStatus } from "@prisma/client";

export const STATUSES: TaskStatus[] = ["NEW", "IN_PROGRESS", "REVIEW", "DONE"];

export const STATUS_META: Record<
  TaskStatus,
  { label: string; emptyText: string; path: string; badgeCls: string }
> = {
  NEW: {
    label: "Новые",
    emptyText: "Новых задач нет",
    path: "/",
    badgeCls:
      "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400",
  },
  IN_PROGRESS: {
    label: "В работе",
    emptyText: "В работе ничего нет",
    path: "/in-progress",
    badgeCls:
      "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400",
  },
  REVIEW: {
    label: "На проверку",
    emptyText: "На проверке ничего нет",
    path: "/review",
    badgeCls:
      "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-400",
  },
  DONE: {
    label: "Готово",
    emptyText: "Готовых задач пока нет",
    path: "/done",
    badgeCls:
      "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400",
  },
};

export const STATUS_BADGE_LABEL: Record<TaskStatus, string> = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  REVIEW: "На проверке",
  DONE: "Готова",
};

// Разрешённые переходы: в «Готово» — только с проверки
export const TRANSITIONS: Record<
  TaskStatus,
  { to: TaskStatus; label: string; primary?: boolean }[]
> = {
  NEW: [{ to: "IN_PROGRESS", label: "Взять в работу", primary: true }],
  IN_PROGRESS: [{ to: "REVIEW", label: "На проверку →", primary: true }],
  REVIEW: [
    { to: "DONE", label: "Принять ✓", primary: true },
    { to: "IN_PROGRESS", label: "Вернуть в работу" },
  ],
  DONE: [{ to: "IN_PROGRESS", label: "Вернуть в работу" }],
};
