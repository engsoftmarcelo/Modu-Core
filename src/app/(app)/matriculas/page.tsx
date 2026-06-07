import type { Metadata } from "next";

import { FeaturePlaceholder } from "@/components/modules/feature-placeholder";
import { matriculasModule } from "@/features/matriculas";

export const metadata: Metadata = { title: "Matriculas" };

export default function MatriculasPage() {
  return <FeaturePlaceholder module={matriculasModule} />;
}
