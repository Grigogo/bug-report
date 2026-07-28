import type { TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { TaskTable } from "@/components/TaskTable";
import { TagFilter } from "@/components/TagFilter";
import { STATUS_META } from "@/lib/status";

export async function TaskListPage({
  status,
  tagId,
}: {
  status: TaskStatus;
  tagId?: string;
}) {
  const [tasks, tags] = await Promise.all([
    prisma.task.findMany({
      where: {
        status,
        ...(tagId ? { tags: { some: { id: tagId } } } : {}),
      },
      orderBy:
        status === "DONE" ? { completedAt: "desc" } : { createdAt: "desc" },
      include: {
        _count: { select: { screenshots: true } },
        comments: { select: { isNew: true } },
        tags: true,
      },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">
        {STATUS_META[status].label}{" "}
        <span className="text-sm font-normal text-zinc-500">
          {tasks.length > 0 && `(${tasks.length})`}
        </span>
      </h1>
      <TagFilter tags={tags} activeTagId={tagId} path={STATUS_META[status].path} />
      <TaskTable tasks={tasks} status={status} />
    </div>
  );
}
