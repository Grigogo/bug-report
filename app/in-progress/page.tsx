import { TaskListPage } from "@/components/TaskListPage";

export const dynamic = "force-dynamic";

export default function InProgressPage() {
  return <TaskListPage status="IN_PROGRESS" />;
}
