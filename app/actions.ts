"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { del } from "@vercel/blob";
import type { TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { STATUSES, STATUS_META, TRANSITIONS } from "@/lib/status";

export type CreateTaskInput = {
  title: string;
  description: string;
  steps?: string;
  screenshotUrls: string[];
  tagIds?: string[];
};

export async function createTask(input: CreateTaskInput) {
  const title = input.title.trim();
  const description = input.description.trim();
  if (!title || !description) {
    throw new Error("Название и описание обязательны");
  }

  await prisma.task.create({
    data: {
      title,
      description,
      steps: input.steps?.trim() || null,
      screenshots: {
        create: input.screenshotUrls.map((url) => ({ url })),
      },
      tags: {
        connect: (input.tagIds ?? []).map((id) => ({ id })),
      },
    },
  });

  revalidatePath("/");
  redirect("/");
}

export async function moveTask(id: string, to: TaskStatus) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw new Error("Задача не найдена");

  const allowed = TRANSITIONS[task.status].some((t) => t.to === to);
  if (!allowed) {
    throw new Error(
      `Переход «${task.status} → ${to}» запрещён: в «Готово» можно только после проверки`,
    );
  }

  // Разработчик обработал замечания (в работу → на проверку) или задача
  // принята — снимаем с комментариев пометку «новый»
  const clearNewComments =
    (task.status === "IN_PROGRESS" && to === "REVIEW") ||
    (task.status === "REVIEW" && to === "DONE");

  await prisma.$transaction([
    prisma.task.update({
      where: { id },
      data: {
        status: to,
        completedAt: to === "DONE" ? new Date() : null,
      },
    }),
    ...(clearNewComments
      ? [
          prisma.comment.updateMany({
            where: { taskId: id, isNew: true },
            data: { isNew: false },
          }),
        ]
      : []),
  ]);

  for (const s of STATUSES) revalidatePath(STATUS_META[s].path);
  revalidatePath(`/tasks/${id}`);
}

export async function createTag(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const color = String(formData.get("color") ?? "zinc");
  if (!name) return;

  await prisma.tag.upsert({
    where: { name },
    update: { color },
    create: { name, color },
  });

  revalidatePath("/tags");
  for (const s of STATUSES) revalidatePath(STATUS_META[s].path);
}

export async function deleteTag(id: string) {
  await prisma.tag.delete({ where: { id } });
  revalidatePath("/tags");
  for (const s of STATUSES) revalidatePath(STATUS_META[s].path);
}

export async function setTaskTags(taskId: string, formData: FormData) {
  const tagIds = formData.getAll("tags").map(String);

  await prisma.task.update({
    where: { id: taskId },
    data: { tags: { set: tagIds.map((id) => ({ id })) } },
  });

  for (const s of STATUSES) revalidatePath(STATUS_META[s].path);
  revalidatePath(`/tasks/${taskId}`);
}

export async function addComment(taskId: string, formData: FormData) {
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  await prisma.comment.create({ data: { taskId, body } });

  for (const s of STATUSES) revalidatePath(STATUS_META[s].path);
  revalidatePath(`/tasks/${taskId}`);
}

export async function deleteTask(id: string) {
  const task = await prisma.task.delete({
    where: { id },
    include: { screenshots: true },
  });

  // Чистим файлы в Blob (локальные дев-файлы /uploads пропускаем);
  // ошибки удаления файлов не должны ронять действие
  await Promise.allSettled(
    task.screenshots
      .filter((s) => s.url.startsWith("https://"))
      .map((s) => del(s.url)),
  );

  for (const s of STATUSES) revalidatePath(STATUS_META[s].path);
  redirect(STATUS_META[task.status].path);
}
