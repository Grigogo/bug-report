import { get } from "@vercel/blob";
import { NextResponse } from "next/server";

// Отдаёт скриншоты из приватного Vercel Blob (браузер их напрямую не видит)
export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url");
  let host = "";
  try {
    host = url ? new URL(url).hostname : "";
  } catch {
    /* некорректный url — отсеется ниже */
  }
  if (!url || !host.endsWith(".blob.vercel-storage.com")) {
    return NextResponse.json({ error: "Некорректный url" }, { status: 400 });
  }

  const blob = await get(url, { access: "private" });
  if (!blob || blob.statusCode !== 200) {
    return NextResponse.json({ error: "Скриншот не найден" }, { status: 404 });
  }

  return new Response(blob.stream, {
    headers: {
      "Content-Type":
        blob.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "private, max-age=86400",
    },
  });
}
