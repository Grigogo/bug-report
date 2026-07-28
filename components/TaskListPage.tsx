import type { TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { TaskTable } from "@/components/TaskTable";
import { STATUS_META } from "@/lib/status";

export async function TaskListPage({ status }: { status: TaskStatus }) {
  const tasks = await prisma.task.findMany({
    where: { status },
    orderBy:
      status === "DONE" ? { completedAt: "desc" } : { createdAt: "desc" },
    include: {
      _count: { select: { screenshots: true } },
      comments: { select: { isNew: true } },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">
        {STATUS_META[status].label}{" "}
        <span className="text-sm font-normal text-zinc-500">
          {tasks.length > 0 && `(${tasks.length})`}
        </span>
      </h1>
      <TaskTable tasks={tasks} status={status} />
    </div>
  );
}
