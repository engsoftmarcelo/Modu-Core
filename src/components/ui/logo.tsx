import Link from "next/link";

import { cn } from "@/lib/utils";

type LogoProps = {
  compact?: boolean;
  className?: string;
  href?: string;
  inverse?: boolean;
};

export function Logo({
  compact = false,
  className,
  href = "/inicio",
  inverse = false,
}: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center gap-3 font-semibold focus-visible:rounded-lg",
        className,
      )}
    >
      <span className="grid size-10 shrink-0 grid-cols-2 gap-1 rounded-lg bg-brand-700 p-2 shadow-sm">
        <span className="rounded-[2px] bg-white" />
        <span className="rounded-[2px] bg-sky-300" />
        <span className="rounded-[2px] bg-emerald-300" />
        <span className="rounded-[2px] bg-amber-300" />
      </span>
      {!compact && (
        <span className={cn("text-xl", inverse ? "text-white" : "text-ink-950")}>
          ModuCore
        </span>
      )}
    </Link>
  );
}
