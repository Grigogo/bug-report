"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { createTask } from "@/app/actions";

const inputCls =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900";

export function NewTaskForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const images = Array.from(list).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...images]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") ?? "").trim();
    const description = String(data.get("description") ?? "").trim();
    const steps = String(data.get("steps") ?? "").trim();

    if (!title || !description) {
      setError("Заполните название и описание");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const screenshotUrls: string[] = [];
      for (const file of files) {
        const blob = await upload(`screenshots/${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        screenshotUrls.push(blob.url);
      }

      await createTask({ title, description, steps, screenshotUrls });
      // createTask делает redirect('/'), сюда управление обычно не возвращается
    } catch (err) {
      // redirect в server action пробрасывается как специальная ошибка — не показываем её
      if (err && typeof err === "object" && "digest" in err) throw err;
      setError(err instanceof Error ? err.message : "Не удалось создать задачу");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="space-y-1.5">
        <label htmlFor="title" className="block text-sm font-medium">
          Название <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={200}
          placeholder="Кнопка «Сохранить» не работает на iOS"
          className={inputCls}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="description" className="block text-sm font-medium">
          Описание <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          placeholder="Что происходит, что ожидалось…"
          className={inputCls}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="steps" className="block text-sm font-medium">
          Шаги воспроизведения{" "}
          <span className="text-xs font-normal text-zinc-500">
            (необязательно)
          </span>
        </label>
        <textarea
          id="steps"
          name="steps"
          rows={4}
          placeholder={"1. Открыть экран…\n2. Нажать…\n3. Увидеть ошибку"}
          className={inputCls}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium">
          Скриншоты{" "}
          <span className="text-xs font-normal text-zinc-500">
            (png/jpg/webp, до 10 МБ каждый)
          </span>
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => addFiles(e.target.files)}
          className="block w-full text-sm text-zinc-500 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200 dark:file:bg-zinc-800 dark:file:text-zinc-200"
        />
        {files.length > 0 && (
          <ul className="flex flex-wrap gap-3 pt-2">
            {files.map((file, i) => (
              <li key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="h-20 w-28 rounded-md border border-zinc-200 object-cover dark:border-zinc-700"
                />
                <button
                  type="button"
                  onClick={() => setFiles(files.filter((_, j) => j !== i))}
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-xs text-white hover:bg-red-600"
                  aria-label="Убрать скриншот"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {submitting ? "Отправка…" : "Создать задачу"}
      </button>
    </form>
  );
}
