"use client";

import { type FormEvent } from "react";
import { CheckCircle2, MessageCircle } from "lucide-react";

import { getSalesWhatsAppNumber } from "@/lib/sales-whatsapp";

const whatsappNumber = getSalesWhatsAppNumber();

const spreadsheetOptions = ["Sim", "Nao", "As vezes"] as const;
const moduleOptions = ["Agenda", "CRM", "Cobranca", "OS", "Matricula"] as const;

function fieldValue(formData: FormData, field: string) {
  return String(formData.get(field) ?? "").trim() || "Nao informado";
}

export function DiagnosticForm() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!whatsappNumber) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const modules = formData.getAll("modules").map(String);
    const message = [
      "Novo diagnostico ModuCore",
      "",
      `Nome: ${fieldValue(formData, "name")}`,
      `Empresa: ${fieldValue(formData, "company")}`,
      `Segmento: ${fieldValue(formData, "segment")}`,
      `WhatsApp: ${fieldValue(formData, "whatsapp")}`,
      `Principal problema: ${fieldValue(formData, "problem")}`,
      `Usa planilha hoje?: ${fieldValue(formData, "spreadsheet")}`,
      `Interesse: ${modules.length > 0 ? modules.join(", ") : "Nao informado"}`,
    ].join("\n");

    window.location.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message,
    )}`;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 sm:p-7"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-ink-950">
          Nome
          <input
            name="name"
            required
            autoComplete="name"
            className="min-h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-ink-950 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-50"
            placeholder="Nome do responsavel"
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-ink-950">
          Empresa
          <input
            name="company"
            required
            autoComplete="organization"
            className="min-h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-ink-950 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-50"
            placeholder="Nome do negocio"
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-ink-950">
          Segmento
          <input
            name="segment"
            required
            className="min-h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-ink-950 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-50"
            placeholder="Salao, estetica, B2B..."
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-ink-950">
          WhatsApp
          <input
            name="whatsapp"
            required
            type="tel"
            autoComplete="tel"
            className="min-h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-ink-950 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-50"
            placeholder="(00) 00000-0000"
          />
        </label>
      </div>

      <label className="mt-5 grid gap-2 text-sm font-bold text-ink-950">
        Principal problema
        <textarea
          name="problem"
          required
          rows={5}
          className="min-h-32 resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-ink-950 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-50"
          placeholder="Conte o que mais atrapalha hoje: agenda, vendas, cobranca, historico, planilha..."
        />
      </label>

      <fieldset className="mt-6">
        <legend className="text-sm font-bold text-ink-950">
          Usa planilha hoje?
        </legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {spreadsheetOptions.map((option) => (
            <label
              key={option}
              className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 transition has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:checked]:text-brand-700"
            >
              <input
                required
                type="radio"
                name="spreadsheet"
                value={option}
                className="size-4 accent-brand-600"
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="text-sm font-bold text-ink-950">
          Quer agenda, CRM, cobranca, OS ou matricula?
        </legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {moduleOptions.map((option) => (
            <label
              key={option}
              className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 has-[:checked]:text-emerald-700"
            >
              <input
                type="checkbox"
                name="modules"
                value={option}
                className="size-4 rounded accent-emerald-600"
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={!whatsappNumber}
          className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-base font-black text-white shadow-lg shadow-emerald-950/15 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none sm:w-auto"
        >
          {whatsappNumber ? "Enviar pelo WhatsApp" : "Canal indisponivel"}
          <MessageCircle className="size-5" />
        </button>
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-500">
          <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
          Os dados viram uma mensagem pronta para conversa.
        </p>
      </div>
    </form>
  );
}
