import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteReport } from "@/app/actions";
import { formatDate } from "@/lib/format";
import { reportTitle, type ReportData } from "@/lib/report";
import { formatDuration } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Отчёты</h1>
        <Link
          href="/reports/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Новый отчёт
        </Link>
      </div>

      {reports.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          Сгенерированных отчётов пока нет — собери первый через «+ Новый отчёт»
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="px-4 py-3 font-medium">Отчёт</th>
                <th className="px-4 py-3 font-medium">Создан</th>
                <th className="px-4 py-3 font-medium">Задач</th>
                <th className="px-4 py-3 font-medium">Время</th>
                <th className="px-4 py-3 text-right font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => {
                const data = report.data as unknown as ReportData;
                return (
                  <tr
                    key={report.id}
                    className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-800/50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/reports/${report.id}`}
                        className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {reportTitle(report.title, report.createdAt)}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{data.rows.length}</td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums">
                      {formatDuration(data.totalSeconds)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3 text-xs">
                        <a
                          href={`/reports/${report.id}/export?format=csv`}
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          CSV
                        </a>
                        <a
                          href={`/reports/${report.id}/export?format=html`}
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          HTML
                        </a>
                        <form action={deleteReport.bind(null, report.id)}>
                          <button
                            type="submit"
                            className="font-medium text-red-600 hover:underline dark:text-red-400"
                          >
                            Удалить
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
