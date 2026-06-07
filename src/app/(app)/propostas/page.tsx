import type { Metadata } from "next";

import { FeaturePlaceholder } from "@/components/modules/feature-placeholder";
import { propostasModule } from "@/features/propostas";

export const metadata: Metadata = { title: "Propostas" };

export default function PropostasPage() {
  return <FeaturePlaceholder module={propostasModule} />;
}
