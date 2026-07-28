import { TaskListPage } from "@/components/TaskListPage";

export const dynamic = "force-dynamic";

export default function ReviewPage() {
  return <TaskListPage status="REVIEW" />;
}
