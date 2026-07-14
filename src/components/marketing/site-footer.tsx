import Link from "next/link";

import { Logo } from "@/components/ui/logo";

const footerLinks = [
  ["CRM B2B", "/modelos/crm-b2b"],
  ["Agenda", "/modelos/agenda"],
  ["Precos", "/precos"],
  ["Diagnostico", "/diagnostico"],
  ["Entrar", "/login"],
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-ink-950 px-5 py-10 text-slate-300 sm:px-8 lg:px-10 print:hidden">
      <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <Logo href="/" inverse />
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
            Sistemas modulares para pequenos negocios venderem, atenderem e se
            organizarem melhor.
          </p>
        </div>
        <nav aria-label="Links do rodape" className="flex flex-wrap gap-x-5 text-sm font-semibold">
          {footerLinks.map(([label, href]) => (
            <Link key={href} href={href} className="inline-flex min-h-11 items-center hover:text-white">
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mx-auto mt-8 max-w-7xl border-t border-slate-800 pt-5 text-xs text-slate-500">
        ModuCore · Belo Horizonte, MG
      </div>
    </footer>
  );
}
