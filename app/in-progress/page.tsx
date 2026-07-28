import { TaskListPage } from "@/components/TaskListPage";

export const dynamic = "force-dynamic";

export default async function InProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  return <TaskListPage status="IN_PROGRESS" tagId={tag} />;
}
