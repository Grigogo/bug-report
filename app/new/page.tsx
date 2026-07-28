import { NewTaskForm } from "@/components/NewTaskForm";

export default function NewTaskPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">Новый баг-репорт</h1>
      <NewTaskForm />
    </div>
  );
}
