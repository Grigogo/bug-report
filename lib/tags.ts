export const TAG_COLORS: Record<string, { label: string; chip: string; dot: string }> = {
  sky: {
    label: "Голубой",
    chip: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
    dot: "bg-sky-500",
  },
  green: {
    label: "Зелёный",
    chip: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
    dot: "bg-green-500",
  },
  amber: {
    label: "Жёлтый",
    chip: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  red: {
    label: "Красный",
    chip: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
    dot: "bg-red-500",
  },
  purple: {
    label: "Фиолетовый",
    chip: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
    dot: "bg-purple-500",
  },
  pink: {
    label: "Розовый",
    chip: "bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300",
    dot: "bg-pink-500",
  },
  teal: {
    label: "Бирюзовый",
    chip: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
    dot: "bg-teal-500",
  },
  zinc: {
    label: "Серый",
    chip: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    dot: "bg-zinc-500",
  },
};

export function tagColor(color: string) {
  return TAG_COLORS[color] ?? TAG_COLORS.zinc;
}
