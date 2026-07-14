import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";

import { Card } from "@/components/ui/card";
import {
  buildAppointmentMessages,
  buildWhatsappLink,
  type AppointmentMessageInput,
} from "@/features/agenda/agendamentos/whatsapp";

type WhatsappMessagesProps = AppointmentMessageInput & {
  contact: string | null;
  customerId: string | null;
};

export function WhatsappMessages({
  contact,
  customerId,
  ...messageInput
}: WhatsappMessagesProps) {
  const messages = buildAppointmentMessages(messageInput);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
          <MessageCircle className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 className="font-bold text-ink-950">Mensagens no WhatsApp</h2>
          <p className="text-xs font-medium text-slate-400">
            Abre o WhatsApp com o texto ja preenchido.
          </p>
        </div>
      </div>

      {contact ? (
        <div className="grid gap-px bg-slate-200">
          {messages.map((message) => {
            const href = buildWhatsappLink(contact, message.text);

            if (!href) {
              return null;
            }

            return (
              <a
                key={message.key}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 bg-white px-5 py-4 transition hover:bg-emerald-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-ink-950">
                    {message.label}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    {message.description}
                  </p>
                </div>
                <ArrowUpRight className="size-4 shrink-0 text-slate-400 transition group-hover:text-emerald-600" />
              </a>
            );
          })}
        </div>
      ) : (
        <div className="px-5 py-6 sm:px-6">
          <p className="text-sm leading-6 text-slate-500">
            Este cliente ainda nao tem WhatsApp ou telefone cadastrado.
          </p>
          {customerId ? (
            <Link
              href={`/crm/${customerId}/editar`}
              className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
            >
              <MessageCircle className="size-4" />
              Adicionar contato do cliente
            </Link>
          ) : (
            <p className="mt-2 text-xs font-medium text-slate-400">
              Vincule um cliente ao agendamento para enviar mensagens.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
