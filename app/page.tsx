import { TaskListPage } from "@/components/TaskListPage";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  return <TaskListPage status="NEW" tagId={tag} />;
}
