import { startTimer, stopTimer } from "@/app/actions";

export function TimerControls({
  taskId,
  isRunning,
  compact,
}: {
  taskId: string;
  isRunning: boolean;
  compact?: boolean;
}) {
  const size = compact ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm";

  return isRunning ? (
    <form action={stopTimer.bind(null, taskId)}>
      <button
        type="submit"
        className={`rounded-md border border-red-300 bg-red-50 font-medium text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900 ${size}`}
      >
        ⏹ Стоп
      </button>
    </form>
  ) : (
    <form action={startTimer.bind(null, taskId)}>
      <button
        type="submit"
        className={`rounded-md border border-zinc-300 font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 ${size}`}
      >
        ▶ Старт
      </button>
    </form>
  );
}
