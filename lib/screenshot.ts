// Приватный Vercel Blob напрямую из браузера не открывается —
// такие скриншоты отдаём через свой прокси /api/screenshot.
// Локальные файлы (/uploads/…) остаются как есть.
export function screenshotSrc(url: string): string {
  return url.includes(".blob.vercel-storage.com")
    ? `/api/screenshot?url=${encodeURIComponent(url)}`
    : url;
}
