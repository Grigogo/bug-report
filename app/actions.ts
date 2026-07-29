"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { del } from "@vercel/blob";
import type { TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ReportData, ReportRow } from "@/lib/report";
import { STATUSES, STATUS_BADGE_LABEL, STATUS_META, TRANSITIONS } from "@/lib/status";
import { totalSeconds } from "@/lib/time";

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

export async function updateTask(id: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const steps = String(formData.get("steps") ?? "").trim();
  const tagIds = formData.getAll("tags").map(String);
  if (!title || !description) {
    throw new Error("Название и описание обязательны");
  }

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw new Error("Задача не найдена");
  if (task.status === "DONE") {
    throw new Error("Готовую задачу редактировать нельзя — сначала верни её в работу");
  }

  await prisma.task.update({
    where: { id },
    data: {
      title,
      description,
      steps: steps || null,
      editedAt: new Date(),
      tags: { set: tagIds.map((tagId) => ({ id: tagId })) },
    },
  });

  for (const s of STATUSES) revalidatePath(STATUS_META[s].path);
  revalidatePath(`/tasks/${id}`);
  redirect(`/tasks/${id}`);
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

  // Задача уходит из «В работе» — останавливаем её таймер
  const stopTimers = task.status === "IN_PROGRESS";

  await prisma.$transaction([
    ...(stopTimers
      ? [
          prisma.timeEntry.updateMany({
            where: { taskId: id, stoppedAt: null },
            data: { stoppedAt: new Date() },
          }),
        ]
      : []),
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

export async function buildReport(formData: FormData) {
  const taskIds = formData.getAll("task").map(String);
  const name = String(formData.get("name") ?? "").trim();
  if (taskIds.length === 0) {
    throw new Error("Отметь хотя бы одну задачу для отчёта");
  }

  const tasks = await prisma.task.findMany({
    where: { id: { in: taskIds } },
    include: {
      tags: true,
      timeEntries: { select: { startedAt: true, stoppedAt: true } },
    },
  });

  const now = new Date();
  const rows: ReportRow[] = tasks
    .map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      tags: t.tags.map((tag) => ({ name: tag.name, color: tag.color })),
      statusLabel: STATUS_BADGE_LABEL[t.status],
      createdAt: t.createdAt.toISOString(),
      seconds: totalSeconds(t.timeEntries, now),
    }))
    .sort((a, b) => b.seconds - a.seconds);

  const data: ReportData = {
    rows,
    totalSeconds: rows.reduce((sum, r) => sum + r.seconds, 0),
  };

  const report = await prisma.report.create({
    data: { title: name || null, data },
  });

  revalidatePath("/reports");
  redirect(`/reports/${report.id}`);
}

export async function deleteReport(id: string) {
  await prisma.report.delete({ where: { id } });
  revalidatePath("/reports");
  redirect("/reports");
}

export async function startTimer(taskId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Задача не найдена");
  if (task.status !== "IN_PROGRESS") {
    throw new Error("Трекер времени доступен только для задач в статусе «В работе»");
  }

  await prisma.$transaction([
    // Один активный таймер на всё приложение: запуск нового останавливает прежний
    prisma.timeEntry.updateMany({
      where: { stoppedAt: null },
      data: { stoppedAt: new Date() },
    }),
    prisma.timeEntry.create({ data: { taskId } }),
  ]);

  revalidatePath(STATUS_META.IN_PROGRESS.path);
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/reports");
}

export async function stopTimer(taskId: string) {
  await prisma.timeEntry.updateMany({
    where: { taskId, stoppedAt: null },
    data: { stoppedAt: new Date() },
  });

  revalidatePath(STATUS_META.IN_PROGRESS.path);
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/reports");
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
