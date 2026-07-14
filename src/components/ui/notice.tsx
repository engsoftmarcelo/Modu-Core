import { AlertCircle, CheckCircle2, Info, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type NoticeProps = {
  children: React.ReactNode;
  className?: string;
  tone?: "error" | "info" | "success";
};

const styles: Record<
  NonNullable<NoticeProps["tone"]>,
  { className: string; icon: LucideIcon }
> = {
  error: {
    className: "border-red-200 bg-red-50 text-red-800",
    icon: AlertCircle,
  },
  info: {
    className: "border-brand-200 bg-brand-50 text-brand-800",
    icon: Info,
  },
  success: {
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
  },
};

export function Notice({ children, className, tone = "info" }: NoticeProps) {
  const Icon = styles[tone].icon;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold",
        styles[tone].className,
        className,
      )}
    >
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      {children}
    </div>
  );
}
