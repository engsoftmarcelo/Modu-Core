import type { Metadata } from "next";

import { FeaturePlaceholder } from "@/components/modules/feature-placeholder";
import { ordensServicoModule } from "@/features/ordens-servico";

export const metadata: Metadata = { title: "Ordens de servico" };

export default function OrdensServicoPage() {
  return <FeaturePlaceholder module={ordensServicoModule} />;
}
