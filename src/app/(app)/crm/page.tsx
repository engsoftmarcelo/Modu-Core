import type { Metadata } from "next";

import { FeaturePlaceholder } from "@/components/modules/feature-placeholder";
import { crmModule } from "@/features/crm";

export const metadata: Metadata = { title: "CRM" };

export default function CrmPage() {
  return <FeaturePlaceholder module={crmModule} />;
}
