import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

// Запасной путь загрузки: браузер шлёт файл нам, а мы кладём его в Blob.
// Нужен, когда прямая загрузка на vercel.com блокируется у клиента (VPN).
// Ограничение платформы: тело запроса до ~4.5 МБ.
export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Vercel Blob не настроен" },
      { status: 403 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Ожидается изображение" }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Файл больше 10 МБ" }, { status: 400 });
  }

  const ext = (/\.([a-zA-Z0-9]+)$/.exec(file.name)?.[1] ?? "png").toLowerCase();
  const blob = await put(`screenshots/${Date.now()}.${ext}`, file, {
    access: "private",
    addRandomSuffix: true,
    contentType: file.type,
  });

  return NextResponse.json({ url: blob.url });
}
