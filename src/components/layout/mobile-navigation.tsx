"use client";

import Link from "next/link";
import { MoreHorizontal, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  mobileMoreNavigation,
  mobileNavigation,
  type NavigationItem,
} from "@/components/layout/navigation";
import { cn } from "@/lib/utils";

function isItemActive(pathname: string, item: NavigationItem) {
  return (
    pathname === item.href ||
    (item.href !== "/inicio" && pathname.startsWith(`${item.href}/`))
  );
}

export function MobileNavigation() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const moreActive = mobileMoreNavigation.some((item) =>
    isItemActive(pathname, item),
  );

  useEffect(() => {
    if (!moreOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMoreOpen(false);
        moreButtonRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [moreOpen]);

  return (
    <>
      {moreOpen ? (
        <>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Fechar menu de modulos"
            className="fixed inset-0 z-40 bg-ink-950/35 lg:hidden"
            onClick={() => setMoreOpen(false)}
          />
          <section
            id="mobile-more-navigation"
            aria-label="Mais areas do sistema"
            className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-50 max-h-[min(70vh,34rem)] overflow-y-auto rounded-t-2xl border-t border-slate-200 bg-white shadow-[0_-16px_40px_rgba(17,20,42,0.16)] lg:hidden"
          >
            <div className="mx-auto max-w-2xl px-4 pb-5 pt-4 sm:px-6">
              <div className="mb-3 flex min-h-11 items-center justify-between">
                <div>
                  <p className="font-bold text-ink-950">Mais areas</p>
                  <p className="text-xs text-slate-500">
                    Acesse todos os modulos do sistema.
                  </p>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  title="Fechar"
                  aria-label="Fechar menu"
                  className="grid size-11 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-ink-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
                  onClick={() => {
                    setMoreOpen(false);
                    moreButtonRef.current?.focus();
                  }}
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {mobileMoreNavigation.map((item) => {
                  const active = isItemActive(pathname, item);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-16 items-center gap-3 rounded-lg border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100",
                        active
                          ? "border-brand-200 bg-brand-50 text-brand-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-ink-950",
                      )}
                      onClick={() => setMoreOpen(false)}
                    >
                      <span
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-lg",
                          active ? "bg-white" : "bg-slate-100",
                        )}
                      >
                        <Icon className="size-5" />
                      </span>
                      <span className="min-w-0 leading-tight">
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      ) : null}

      <nav
        aria-label="Navegacao principal no celular"
        className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-slate-200 bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(17,20,42,0.08)] lg:hidden"
      >
        {mobileNavigation.map((item) => {
          const active = isItemActive(pathname, item);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-semibold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100",
                active ? "bg-brand-50 text-brand-700" : "text-slate-500",
              )}
            >
              <Icon className="size-5" />
              <span className="max-w-full truncate">
                {item.shortName ?? item.name}
              </span>
            </Link>
          );
        })}

        <button
          ref={moreButtonRef}
          type="button"
          aria-controls="mobile-more-navigation"
          aria-expanded={moreOpen}
          className={cn(
            "flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-semibold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100",
            moreOpen || moreActive
              ? "bg-brand-50 text-brand-700"
              : "text-slate-500",
          )}
          onClick={() => setMoreOpen((open) => !open)}
        >
          <MoreHorizontal className="size-5" />
          Mais
        </button>
      </nav>
    </>
  );
}
