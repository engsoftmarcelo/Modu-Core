import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { StudentStatus } from "../types";

type StudentSearchProps = {
  query: string;
  status: StudentStatus | "all";
};

export function StudentSearch({ query, status }: StudentSearchProps) {
  return (
    <form
      action="/matriculas"
      method="get"
      className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_220px_auto]"
    >
      <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100">
        <Search className="size-5 shrink-0 text-slate-400" />
        <span className="sr-only">Buscar alunos</span>
        <input
          type="search"
          name="q"
          defaultValue={query}
          maxLength={80}
          placeholder="Buscar por nome, WhatsApp, e-mail ou CPF"
          className="min-w-0 flex-1 bg-transparent text-base text-ink-950 outline-none placeholder:text-slate-400"
        />
      </label>

      <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100">
        <SlidersHorizontal className="size-4 shrink-0 text-slate-400" />
        <span className="sr-only">Filtrar por status</span>
        <select
          name="status"
          defaultValue={status}
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-700 outline-none"
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
      </label>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1 md:flex-none">
          Buscar
        </Button>
        {(query || status !== "all") && (
          <Link
            href="/matriculas"
            aria-label="Limpar filtros"
            className="grid size-12 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-ink-950"
          >
            <X className="size-5" />
          </Link>
        )}
      </div>
    </form>
  );
}
