"use client";

import Link from "next/link";
import {
  BadgeCheck,
  BookOpenCheck,
  Award,
  CalendarCheck2,
  CalendarDays,
  PlayCircle,
  UsersRound,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

const tabs = [
  {
    href: "/matriculas",
    label: "Alunos",
    icon: UsersRound,
    isActive: (pathname: string) =>
      (pathname === "/matriculas" ||
        pathname.startsWith("/matriculas/novo") ||
        /^\/matriculas\/[^/]+(\/editar)?$/.test(pathname)) &&
      !pathname.startsWith("/matriculas/cursos") &&
      !pathname.startsWith("/matriculas/certificados") &&
      !pathname.startsWith("/matriculas/demo") &&
      !pathname.startsWith("/matriculas/frequencia") &&
      !pathname.startsWith("/matriculas/inscricoes") &&
      !pathname.startsWith("/matriculas/turmas"),
  },
  {
    href: "/matriculas/demo",
    label: "Demo",
    icon: PlayCircle,
    isActive: (pathname: string) => pathname.startsWith("/matriculas/demo"),
  },
  {
    href: "/matriculas/cursos",
    label: "Cursos",
    icon: BookOpenCheck,
    isActive: (pathname: string) => pathname.startsWith("/matriculas/cursos"),
  },
  {
    href: "/matriculas/turmas",
    label: "Turmas",
    icon: CalendarDays,
    isActive: (pathname: string) => pathname.startsWith("/matriculas/turmas"),
  },
  {
    href: "/matriculas/inscricoes",
    label: "Matriculas",
    icon: BadgeCheck,
    isActive: (pathname: string) =>
      pathname.startsWith("/matriculas/inscricoes"),
  },
  {
    href: "/matriculas/frequencia",
    label: "Frequencia",
    icon: CalendarCheck2,
    isActive: (pathname: string) =>
      pathname.startsWith("/matriculas/frequencia"),
  },
  {
    href: "/matriculas/certificados",
    label: "Certificados",
    icon: Award,
    isActive: (pathname: string) =>
      pathname.startsWith("/matriculas/certificados"),
  },
];

export function MatriculasTabs() {
  const pathname = usePathname();
  const activeTabRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    activeTabRef.current?.scrollIntoView({
      behavior: "auto",
      block: "nearest",
      inline: "center",
    });
  }, [pathname]);

  return (
    <nav
      aria-label="Areas de matriculas"
      className="inline-flex max-w-full snap-x scroll-px-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = tab.isActive(pathname);

        return (
          <Link
            ref={active ? activeTabRef : undefined}
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-lg px-4 text-sm font-semibold transition",
              active
                ? "bg-ink-950 text-white"
                : "text-slate-500 hover:bg-slate-50 hover:text-ink-950",
            )}
          >
            <Icon className="size-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
