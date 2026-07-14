import { Badge } from "@/components/ui/badge";

export function CourseActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge tone={active ? "green" : "slate"}>
      {active ? "Ativo" : "Inativo"}
    </Badge>
  );
}
