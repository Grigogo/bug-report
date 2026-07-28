"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export type CreateTaskInput = {
  title: string;
  description: string;
  steps?: string;
  screenshotUrls: string[];
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
    },
  });

  revalidatePath("/");
  redirect("/");
}

export async function completeTask(id: string) {
  await prisma.task.update({
    where: { id },
    data: { status: "DONE", completedAt: new Date() },
  });
  revalidatePath("/");
  revalidatePath("/done");
  revalidatePath(`/tasks/${id}`);
}

export async function reopenTask(id: string) {
  await prisma.task.update({
    where: { id },
    data: { status: "OPEN", completedAt: null },
  });
  revalidatePath("/");
  revalidatePath("/done");
  revalidatePath(`/tasks/${id}`);
}

export async function deleteTask(id: string) {
  const task = await prisma.task.delete({
    where: { id },
    include: { screenshots: true },
  });

  // Чистим файлы в Blob; ошибки удаления файлов не должны ронять действие
  await Promise.allSettled(task.screenshots.map((s) => del(s.url)));

  revalidatePath("/");
  revalidatePath("/done");
  redirect(task.status === "DONE" ? "/done" : "/");
}
