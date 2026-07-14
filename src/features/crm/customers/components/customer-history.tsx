import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  History,
  RotateCcw,
  Scissors,
  StickyNote,
  UserRound,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { AppointmentStatusBadge } from "@/features/agenda/agendamentos/components/appointment-status-badge";
import type { CustomerHistory as CustomerHistoryData } from "@/features/crm/customers/queries";
import { formatDateTime } from "@/lib/utils";

type CustomerHistoryProps = {
  customerNotes: string | null;
  history: CustomerHistoryData;
};

export function CustomerHistory({
  customerNotes,
  history,
}: CustomerHistoryProps) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <History className="size-5" />
          </span>
          <div>
            <h2 className="font-bold text-ink-950">Historico do cliente</h2>
            <p className="mt-1 text-sm text-slate-500">
              Agendamentos, servicos feitos, observacoes e proximo retorno.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-px bg-slate-200 lg:grid-cols-[1.35fr_0.9fr]">
        <section className="bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">
                Agendamentos passados
              </p>
              <h3 className="mt-1 font-bold text-ink-950">
                Ultimos atendimentos
              </h3>
            </div>
            <Clock3 className="size-5 text-brand-600" />
          </div>

          <div className="mt-5 space-y-3">
            {history.pastAppointments.length ? (
              history.pastAppointments.map((appointment) => (
                <Link
                  key={appointment.id}
                  href={`/agenda/agendamentos/${appointment.id}`}
                  className="block rounded-2xl border border-slate-200 p-4 transition hover:border-brand-200 hover:bg-brand-50"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-bold text-ink-950">
                        {appointment.serviceName ?? appointment.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatDateTime(appointment.starts_at)}
                      </p>
                    </div>
                    <AppointmentStatusBadge status={appointment.status} />
                  </div>
                  {(appointment.professionalName || appointment.notes) && (
                    <div className="mt-3 space-y-2 text-sm text-slate-500">
                      {appointment.professionalName && (
                        <p className="flex items-center gap-2">
                          <UserRound className="size-4 text-slate-500" />
                          {appointment.professionalName}
                        </p>
                      )}
                      {appointment.notes && (
                        <p className="line-clamp-2 leading-6">
                          {appointment.notes}
                        </p>
                      )}
                    </div>
                  )}
                </Link>
              ))
            ) : (
              <EmptyHistory
                icon={CalendarClock}
                text="Nenhum agendamento passado registrado para este cliente."
              />
            )}
          </div>
        </section>

        <aside className="space-y-px bg-slate-200">
          <section className="bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="size-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">
                  Servicos feitos
                </p>
                <h3 className="font-bold text-ink-950">Historico de consumo</h3>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {history.servicesDone.length ? (
                history.servicesDone.map((service) => (
                  <div
                    key={service.name}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Scissors className="mt-0.5 size-5 text-emerald-600" />
                      <div>
                        <p className="font-semibold text-ink-950">
                          {service.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {service.count}{" "}
                          {service.count === 1
                            ? "atendimento concluido"
                            : "atendimentos concluidos"}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          Ultimo em {formatDateTime(service.lastDoneAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyHistory
                  icon={Scissors}
                  text="Nenhum servico concluido aparece no historico ainda."
                />
              )}
            </div>
          </section>

          <section className="bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-700">
                <StickyNote className="size-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">
                  Observacoes
                </p>
                <h3 className="font-bold text-ink-950">Pontos importantes</h3>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
              {customerNotes ? (
                <p className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-4">
                  {customerNotes}
                </p>
              ) : null}
              {history.appointmentNotes.map((note, index) => (
                <p
                  key={`${note}-${index}`}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  {note}
                </p>
              ))}
              {!customerNotes && !history.appointmentNotes.length ? (
                <EmptyHistory
                  icon={StickyNote}
                  text="Nenhuma observacao registrada."
                />
              ) : null}
            </div>
          </section>

          <section className="bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-700">
                <RotateCcw className="size-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">
                  Proximo retorno
                </p>
                <h3 className="font-bold text-ink-950">Agenda futura</h3>
              </div>
            </div>

            <div className="mt-5">
              {history.nextReturn ? (
                <Link
                  href={`/agenda/agendamentos/${history.nextReturn.id}`}
                  className="block rounded-2xl border border-amber-200 bg-amber-50 p-4 transition hover:bg-amber-100"
                >
                  <p className="font-bold text-ink-950">
                    {history.nextReturn.serviceName ?? history.nextReturn.title}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-amber-800">
                    {formatDateTime(history.nextReturn.starts_at)}
                  </p>
                  {history.nextReturn.professionalName && (
                    <p className="mt-2 text-sm text-slate-600">
                      {history.nextReturn.professionalName}
                    </p>
                  )}
                </Link>
              ) : (
                <EmptyHistory
                  icon={RotateCcw}
                  text="Nenhum retorno futuro agendado."
                />
              )}
            </div>
          </section>
        </aside>
      </div>
    </Card>
  );
}

function EmptyHistory({
  icon: Icon,
  text,
}: {
  icon: LucideIcon;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm leading-6 text-slate-500">
      <Icon className="mb-3 size-5 text-slate-300" />
      {text}
    </div>
  );
}
