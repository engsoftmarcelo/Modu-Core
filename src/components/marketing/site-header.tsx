import Link from "next/link";
import { LogIn, MessageCircle } from "lucide-react";

import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  inverse?: boolean;
  overlay?: boolean;
  whatsappHref: string;
};

export function SiteHeader({
  inverse = false,
  overlay = false,
  whatsappHref,
}: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "z-30 w-full print:hidden",
        overlay ? "absolute inset-x-0 top-0" : "border-b border-slate-200 bg-white",
      )}
    >
      <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <Logo href="/" inverse={inverse} />

        <nav
          aria-label="Navegacao comercial"
          className={cn(
            "hidden items-center gap-6 text-sm font-semibold md:flex",
            inverse ? "text-slate-300" : "text-slate-600",
          )}
        >
          <Link className="transition-colors hover:text-brand-500" href="/#modelos">
            Modelos
          </Link>
          <Link className="transition-colors hover:text-brand-500" href="/#produto">
            Produto
          </Link>
          <Link className="transition-colors hover:text-brand-500" href="/precos">
            Precos
          </Link>
          <Link className="transition-colors hover:text-brand-500" href="/diagnostico">
            Diagnostico
          </Link>
          <Link className="transition-colors hover:text-brand-500" href="/login">
            Entrar
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            title="Entrar no ModuCore"
            aria-label="Entrar no ModuCore"
            className={cn(
              "grid size-11 place-items-center rounded-lg border transition-colors md:hidden",
              inverse
                ? "border-white/20 text-white hover:bg-white/10"
                : "border-slate-200 text-slate-600 hover:bg-slate-50",
            )}
          >
            <LogIn className="size-5" />
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-emerald-700 bg-emerald-700 px-3 text-sm font-semibold text-white shadow-sm transition-colors hover:border-emerald-800 hover:bg-emerald-800 sm:px-4"
          >
            <MessageCircle className="size-4" />
            <span className="hidden sm:inline">Falar no WhatsApp</span>
          </a>
        </div>
      </div>
    </header>
  );
}
