import { TaskListPage } from "@/components/TaskListPage";

export const dynamic = "force-dynamic";

export default function DonePage() {
  return <TaskListPage status="DONE" />;
}
