import Link from "next/link";
import {
  BadgeCheck,
  ChevronRight,
  Clock,
  Eye,
  Pencil,
  Scissors,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CollectionEmptyState } from "@/components/ui/empty-state";
import { getInitials } from "@/lib/utils";

import type { ProfessionalWithServices } from "../types";
import { ProfessionalActiveToggle } from "./professional-active-toggle";
import { ProfessionalStatusBadge } from "./professional-status-badge";

function ServiceTags({ services }: { services: ProfessionalWithServices["services"] }) {
  if (!services.length) {
    return <span className="text-sm text-slate-400">Nenhum servico</span>;
  }

  const visible = services.slice(0, 3);
  const remaining = services.length - visible.length;

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((service) => (
        <Badge key={service.id} tone="violet">
          {service.name}
        </Badge>
      ))}
      {remaining > 0 ? <Badge tone="slate">+{remaining}</Badge> : null}
    </div>
  );
}

export function ProfessionalList({
  professionals,
  count,
  hasFilters = false,
}: {
  professionals: ProfessionalWithServices[];
  count: number;
  hasFilters?: boolean;
}) {
  if (!professionals.length) {
    return (
      <CollectionEmptyState
        hasFilters={hasFilters}
        icon={UserRound}
        tone="violet"
        emptyTitle="Voce ainda nao cadastrou sua equipe."
        emptyDescription="Adicione o primeiro profissional para organizar especialidades, horarios e atendimentos."
        filteredTitle="Nenhum profissional corresponde aos filtros."
        filteredDescription="Tente outro nome, especialidade ou situacao para ampliar os resultados."
        createHref="/agenda/profissionais/novo"
        createLabel="Cadastrar primeiro profissional"
        clearHref="/agenda/profissionais"
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6">
        <p className="font-bold text-ink-950">
          {count} {count === 1 ? "profissional" : "profissionais"}
        </p>
        {count > 100 ? (
          <p className="mt-1 text-xs text-slate-500">
            Exibindo os primeiros 100 resultados.
          </p>
        ) : null}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[960px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              <th className="px-6 py-4">Profissional</th>
              <th className="px-5 py-4">Servicos</th>
              <th className="px-5 py-4">Horario</th>
              <th className="px-5 py-4">Situacao</th>
              <th className="px-6 py-4 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {professionals.map((professional) => (
              <tr
                key={professional.id}
                className="border-b border-slate-100 transition last:border-0 hover:bg-violet-50/30"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-700">
                      {getInitials(professional.name)}
                    </span>
                    <div className="min-w-0">
                      <Link
                        href={`/agenda/profissionais/${professional.id}`}
                        className="font-bold text-ink-950 hover:text-violet-700"
                      >
                        {professional.name}
                      </Link>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                        <BadgeCheck className="size-3.5" />
                        {professional.specialty || "Sem especialidade"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <ServiceTags services={professional.services} />
                </td>
                <td className="px-5 py-4">
                  <p className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="size-4 shrink-0 text-slate-400" />
                    <span className="max-w-[220px] truncate">
                      {professional.available_hours || "Nao informado"}
                    </span>
                  </p>
                </td>
                <td className="px-5 py-4">
                  <ProfessionalActiveToggle
                    professionalId={professional.id}
                    professionalName={professional.name}
                    active={professional.active}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`/agenda/profissionais/${professional.id}`}
                      aria-label={`Ver ${professional.name}`}
                      className="grid size-10 place-items-center rounded-xl text-slate-400 transition hover:bg-white hover:text-violet-700"
                    >
                      <Eye className="size-[18px]" />
                    </Link>
                    <Link
                      href={`/agenda/profissionais/${professional.id}/editar`}
                      aria-label={`Editar ${professional.name}`}
                      className="grid size-10 place-items-center rounded-xl text-slate-400 transition hover:bg-white hover:text-violet-700"
                    >
                      <Pencil className="size-[18px]" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 lg:hidden">
        {professionals.map((professional) => (
          <Link
            key={professional.id}
            href={`/agenda/profissionais/${professional.id}`}
            className="flex gap-3 p-5 transition hover:bg-violet-50/40"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-700">
              {getInitials(professional.name)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold text-ink-950">
                    {professional.name}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-slate-500">
                    {professional.specialty || "Sem especialidade"}
                  </p>
                </div>
                <ProfessionalStatusBadge active={professional.active} />
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Scissors className="size-3.5" />
                {professional.services.length
                  ? `${professional.services.length} servico${professional.services.length === 1 ? "" : "s"}`
                  : "Nenhum servico"}
              </div>
            </div>
            <ChevronRight className="mt-2 size-5 shrink-0 text-slate-300" />
          </Link>
        ))}
      </div>
    </Card>
  );
}
