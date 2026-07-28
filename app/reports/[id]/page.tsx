import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteReport } from "@/app/actions";
import { PrintButton } from "@/components/PrintButton";
import { formatDate } from "@/lib/format";
import { reportTitle, type ReportData } from "@/lib/report";
import { tagColor } from "@/lib/tags";
import { formatDuration } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) notFound();

  const data = report.data as unknown as ReportData;

  return (
    <div className="space-y-5">
      <Link
        href="/reports"
        className="no-print text-sm text-zinc-500 hover:underline"
      >
        ← Все отчёты
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">
            {reportTitle(report.title, report.createdAt)}
          </h1>
          <p className="mt-0.5 text-xs text-zinc-500">
            Построен {formatDate(report.createdAt)} · задач: {data.rows.length} ·
            всего времени: {formatDuration(data.totalSeconds)}
          </p>
        </div>
        <div className="no-print flex items-center gap-2">
          <a
            href={`/reports/${report.id}/export?format=csv`}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            ⬇ CSV (Excel)
          </a>
          <a
            href={`/reports/${report.id}/export?format=html`}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            ⬇ HTML
          </a>
          <PrintButton />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th className="px-4 py-3 font-medium">Задача</th>
              <th className="px-4 py-3 font-medium">Описание</th>
              <th className="px-4 py-3 font-medium">Проект</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium">Создана</th>
              <th className="px-4 py-3 text-right font-medium">Время</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-zinc-100 align-top last:border-0 dark:border-zinc-800/50"
              >
                <td className="max-w-52 px-4 py-3 font-medium">{row.title}</td>
                <td className="max-w-md whitespace-pre-wrap px-4 py-3 text-zinc-600 dark:text-zinc-300">
                  {row.description}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {row.tags.length > 0
                      ? row.tags.map((tag) => (
                          <span
                            key={tag.name}
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${tagColor(tag.color).chip}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${tagColor(tag.color).dot}`}
                            />
                            {tag.name}
                          </span>
                        ))
                      : "—"}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3">{row.statusLabel}</td>
                <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-400">
                  {formatDate(new Date(row.createdAt))}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                  {formatDuration(row.seconds)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
              <td className="px-4 py-3 font-semibold" colSpan={5}>
                Итого
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums">
                {formatDuration(data.totalSeconds)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <form action={deleteReport.bind(null, report.id)} className="no-print">
        <button
          type="submit"
          className="rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
        >
          Удалить отчёт
        </button>
      </form>
    </div>
  );
}
