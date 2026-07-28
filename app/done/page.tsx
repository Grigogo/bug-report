import { prisma } from "@/lib/prisma";
import { TaskTable } from "@/components/TaskTable";

export const dynamic = "force-dynamic";

export default async function DonePage() {
  const tasks = await prisma.task.findMany({
    where: { status: "DONE" },
    orderBy: { completedAt: "desc" },
    include: { _count: { select: { screenshots: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">
        Завершённые задачи{" "}
        <span className="text-sm font-normal text-zinc-500">
          {tasks.length > 0 && `(${tasks.length})`}
        </span>
      </h1>
      <TaskTable tasks={tasks} variant="done" />
    </div>
  );
}
