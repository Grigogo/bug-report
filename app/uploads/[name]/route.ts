import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

// Скриншоты из public/uploads, добавленные ПОСЛЕ сборки: standalone-сервер
// в Docker знает только файлы, существовавшие на момент next build, поэтому
// свежие загрузки отдаём этим обработчиком. Для файлов, попавших в сборку,
// статика public срабатывает раньше и сюда запрос не доходит.
export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  // Один сегмент пути, без подкаталогов и выхода наружу
  const safe = path.basename(decodeURIComponent(name));
  if (safe !== decodeURIComponent(name) || safe.startsWith(".")) {
    return NextResponse.json({ error: "Некорректное имя" }, { status: 400 });
  }

  try {
    const file = await readFile(path.join(process.cwd(), "public", "uploads", safe));
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": MIME[path.extname(safe).toLowerCase()] ?? "application/octet-stream",
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Файл не найден" }, { status: 404 });
  }
}
