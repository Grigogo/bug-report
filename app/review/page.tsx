import { TaskListPage } from "@/components/TaskListPage";

export const dynamic = "force-dynamic";

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  return <TaskListPage status="REVIEW" tagId={tag} />;
}
