import { prisma } from "@/lib/prisma";
import { NewTaskForm } from "@/components/NewTaskForm";

export const dynamic = "force-dynamic";

export default async function NewTaskPage() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, color: true },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">Новый баг-репорт</h1>
      <NewTaskForm tags={tags} />
    </div>
  );
}
