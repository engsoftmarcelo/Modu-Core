import type { Metadata } from "next";

import { FeaturePlaceholder } from "@/components/modules/feature-placeholder";
import { agendaModule } from "@/features/agenda";

export const metadata: Metadata = { title: "Agenda" };

export default function AgendaPage() {
  return <FeaturePlaceholder module={agendaModule} />;
}
