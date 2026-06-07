import type { Metadata } from "next";

import { FeaturePlaceholder } from "@/components/modules/feature-placeholder";
import { tarefasModule } from "@/features/tarefas";

export const metadata: Metadata = { title: "Tarefas" };

export default function TarefasPage() {
  return <FeaturePlaceholder module={tarefasModule} />;
}
