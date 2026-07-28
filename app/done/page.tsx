import { TaskListPage } from "@/components/TaskListPage";

export const dynamic = "force-dynamic";

export default async function DonePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  return <TaskListPage status="DONE" tagId={tag} />;
}
