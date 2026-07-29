import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

// Фолбэк вместо Vercel Blob: сохраняет скриншоты в public/uploads.
// Работает только когда Blob не настроен (локальный запуск); на хостинге
// с BLOB_READ_WRITE_TOKEN отключён — там работает /api/upload.
export async function POST(request: Request): Promise<NextResponse> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Настроен Vercel Blob — используйте /api/upload" }, { status: 403 });
  }

  // На Vercel файловая система только для чтения — сохранить локально нельзя
  if (process.env.VERCEL) {
    return NextResponse.json(
      { error: "Хранилище скриншотов не настроено: добавьте переменную BLOB_READ_WRITE_TOKEN и переразверните проект" },
      { status: 403 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Ожидается изображение" }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9а-яА-ЯёЁ._-]/g, "_");
  const fileName = `${Date.now()}-${safeName}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `/uploads/${fileName}` });
}
