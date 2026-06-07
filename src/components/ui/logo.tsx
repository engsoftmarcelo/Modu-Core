import Link from "next/link";

import { cn } from "@/lib/utils";

type LogoProps = {
  compact?: boolean;
  className?: string;
  href?: string;
};

export function Logo({ compact = false, className, href = "/inicio" }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-3 font-semibold", className)}
    >
      <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-2xl bg-ink-950 shadow-lg shadow-indigo-950/15">
        <span className="absolute -right-2 -top-2 size-6 rounded-full bg-violet-500" />
        <span className="relative text-base font-black tracking-tight text-white">M</span>
      </span>
      {!compact && (
        <span className="text-xl tracking-[-0.04em] text-ink-950">ModuCore</span>
      )}
    </Link>
  );
}
