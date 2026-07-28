import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatHMS, reportTitle, type ReportData } from "@/lib/report";
import { formatDate } from "@/lib/format";
import { formatDuration } from "@/lib/time";

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) return new NextResponse("Отчёт не найден", { status: 404 });

  const data = report.data as unknown as ReportData;
  const title = reportTitle(report.title, report.createdAt);
  const format = new URL(request.url).searchParams.get("format") ?? "csv";
  const fileBase = `report-${report.createdAt.toISOString().slice(0, 10)}-${report.id.slice(-6)}`;

  if (format === "csv") {
    // Разделитель «;» и BOM — чтобы русский Excel открывал файл сразу корректно
    const lines = [
      ["Задача", "Описание", "Проект", "Статус", "Создана", "Время (ч:мм:сс)"],
      ...data.rows.map((r) => [
        r.title,
        r.description,
        r.tags.map((t) => t.name).join(", "),
        r.statusLabel,
        formatDate(new Date(r.createdAt)),
        formatHMS(r.seconds),
      ]),
      ["Итого", "", "", "", "", formatHMS(data.totalSeconds)],
    ];
    const csv =
      "﻿" + lines.map((row) => row.map(csvCell).join(";")).join("\r\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileBase}.csv"`,
      },
    });
  }

  if (format === "html") {
    const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif; margin: 40px; color: #18181b; }
  h1 { font-size: 20px; }
  .meta { color: #71717a; font-size: 13px; margin-bottom: 20px; }
  table { border-collapse: collapse; width: 100%; font-size: 14px; }
  th, td { border: 1px solid #d4d4d8; padding: 8px 10px; text-align: left; vertical-align: top; }
  th { background: #f4f4f5; font-size: 12px; text-transform: uppercase; letter-spacing: .03em; }
  td.num { text-align: right; white-space: nowrap; }
  tfoot td { font-weight: 600; background: #fafafa; }
</style>
</head>
<body>
<h1>${escapeHtml(title)}</h1>
<p class="meta">Построен ${formatDate(report.createdAt)} · задач: ${data.rows.length} · всего времени: ${formatDuration(data.totalSeconds)}</p>
<table>
<thead><tr><th>Задача</th><th>Описание</th><th>Проект</th><th>Статус</th><th>Создана</th><th>Время</th></tr></thead>
<tbody>
${data.rows
  .map(
    (r) => `<tr>
<td><strong>${escapeHtml(r.title)}</strong></td>
<td>${escapeHtml(r.description)}</td>
<td>${escapeHtml(r.tags.map((t) => t.name).join(", ") || "—")}</td>
<td>${escapeHtml(r.statusLabel)}</td>
<td>${formatDate(new Date(r.createdAt))}</td>
<td class="num">${formatHMS(r.seconds)}</td>
</tr>`,
  )
  .join("\n")}
</tbody>
<tfoot><tr><td colspan="5">Итого</td><td class="num">${formatHMS(data.totalSeconds)}</td></tr></tfoot>
</table>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileBase}.html"`,
      },
    });
  }

  return new NextResponse("Неизвестный формат: используйте ?format=csv или ?format=html", {
    status: 400,
  });
}
