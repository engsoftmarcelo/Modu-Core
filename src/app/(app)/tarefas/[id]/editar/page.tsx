import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Pencil } from "lucide-react";

import { Card } from "@/components/ui/card";
import { TaskForm } from "@/features/tarefas/components/task-form";
import {
  getTaskById,
  getTaskRelationOptions,
} from "@/features/tarefas/queries";

type EditTaskPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditTaskPageProps): Promise<Metadata> {
  const { id } = await params;
  const task = await getTaskById(id);

  return { title: task ? `Editar ${task.title}` : "Editar tarefa" };
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { id } = await params;
  const [task, options] = await Promise.all([
    getTaskById(id),
    getTaskRelationOptions(),
  ]);

  if (!task) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href={`/tarefas/${task.id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-amber-700"
      >
        <ChevronLeft className="size-4" />
        Voltar para a tarefa
      </Link>

      <div className="flex items-center gap-4">
        <span className="grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-700">
          <Pencil className="size-5" />
        </span>
        <div>
          <h1 className="text-3xl font-bold text-ink-950">
            Editar tarefa
          </h1>
          <p className="mt-1 text-slate-500">
            Atualize o prazo e o andamento de {task.title}.
          </p>
        </div>
      </div>

      <Card className="p-5 sm:p-7">
        <TaskForm mode="edit" task={task} options={options} />
      </Card>
    </div>
  );
}
