// Мгновенная заглушка при переходах: страницы динамические (запросы к БД),
// без неё навигация «подвисает» на время ответа сервера
export default function Loading() {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-zinc-400">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-300" />
      <p className="text-sm">Загрузка…</p>
    </div>
  );
}
