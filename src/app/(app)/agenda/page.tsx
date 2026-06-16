import type { Metadata } from "next";

import { FeaturePlaceholder } from "@/components/modules/feature-placeholder";
import { AgendaTabs } from "@/features/agenda/agenda-tabs";
import { agendaModule } from "@/features/agenda";

export const metadata: Metadata = { title: "Agenda" };

export default function AgendaPage() {
  return (
    <div className="space-y-6">
      <AgendaTabs />
      <FeaturePlaceholder module={agendaModule} />
    </div>
  );
}
