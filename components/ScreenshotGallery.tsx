"use client";

import { useCallback, useEffect, useState } from "react";

type Shot = { id: string; url: string };

export function ScreenshotGallery({ screenshots }: { screenshots: Shot[] }) {
  const [index, setIndex] = useState<number | null>(null);

  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + screenshots.length) % screenshots.length)),
    [screenshots.length],
  );
  const next = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % screenshots.length)),
    [screenshots.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, close, prev, next]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {screenshots.map((shot, i) => (
          <button
            key={shot.id}
            type="button"
            onClick={() => setIndex(i)}
            className="block cursor-zoom-in overflow-hidden rounded-md border border-zinc-200 hover:opacity-90 dark:border-zinc-700"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shot.url}
              alt={`Скриншот ${i + 1}`}
              className="aspect-video w-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {index !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/90"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between px-4 py-3 text-sm text-zinc-300">
            <span>
              {index + 1} / {screenshots.length}
            </span>
            <div className="flex items-center gap-4">
              <a
                href={screenshots[index].url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="hover:text-white hover:underline"
              >
                Открыть оригинал ↗
              </a>
              <button
                type="button"
                onClick={close}
                aria-label="Закрыть"
                className="flex h-8 w-8 items-center justify-center rounded-full text-xl hover:bg-white/10 hover:text-white"
              >
                ×
              </button>
            </div>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-14 pb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={screenshots[index].url}
              alt={`Скриншот ${index + 1}`}
              onClick={(e) => e.stopPropagation()}
              className="max-h-full max-w-full rounded-md object-contain shadow-2xl"
            />

            {screenshots.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  aria-label="Предыдущий"
                  className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/25"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  aria-label="Следующий"
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/25"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
