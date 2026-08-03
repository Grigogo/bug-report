// Скачивает все файлы из приватного Vercel Blob в deploy/backup/uploads/
// и пишет deploy/backup/rewrite-screenshots.sql — перепись URL в таблице
// Screenshot с blob-адресов на локальные /uploads/<имя>.
// Запуск: BLOB_READ_WRITE_TOKEN=… node deploy/download-blobs.mjs
import { list, get } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import path from "path";

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error("Нужна переменная BLOB_READ_WRITE_TOKEN");
  process.exit(1);
}

const outDir = "deploy/backup/uploads";
await mkdir(outDir, { recursive: true });

const rewrites = [];
let cursor;
let n = 0;
do {
  const page = await list({ token, cursor, limit: 100 });
  for (const blob of page.blobs) {
    // Имена генерировались ASCII (screenshots/<ts>-<suffix>.<ext>) — basename уникален
    const fileName = path.posix.basename(blob.pathname);
    const res = await get(blob.url, { access: "private", token });
    if (!res || res.statusCode !== 200) {
      console.error(`!! Не скачался: ${blob.url} (${res?.statusCode})`);
      continue;
    }
    await pipeline(Readable.fromWeb(res.stream), createWriteStream(path.join(outDir, fileName)));
    rewrites.push(
      `UPDATE "Screenshot" SET url = '/uploads/${fileName}' WHERE url = '${blob.url}';`,
    );
    n++;
    console.log(`   ${blob.pathname} -> ${fileName}`);
  }
  cursor = page.cursor;
} while (cursor);

await writeFile(
  "deploy/backup/rewrite-screenshots.sql",
  rewrites.join("\n") + "\n",
);
console.log(`✅ Скачано файлов: ${n}; rewrite-screenshots.sql готов`);
