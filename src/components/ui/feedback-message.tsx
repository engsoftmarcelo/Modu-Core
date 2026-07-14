import {
  CheckCircle2,
  CircleAlert,
  Info,
  LoaderCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";

type FeedbackTone = "error" | "info" | "loading" | "success";
type FeedbackVariant = "banner" | "inline";

type FeedbackMessageProps = {
  children: React.ReactNode;
  className?: string;
  tone: FeedbackTone;
  variant?: FeedbackVariant;
};

const toneStyles: Record<FeedbackTone, string> = {
  error: "border-red-200 bg-red-50 text-red-700",
  info: "border-brand-200 bg-brand-50 text-brand-700",
  loading: "border-slate-200 bg-slate-50 text-slate-600",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

const toneIcons = {
  error: CircleAlert,
  info: Info,
  loading: LoaderCircle,
  success: CheckCircle2,
};

export function FeedbackMessage({
  children,
  className,
  tone,
  variant = "banner",
}: FeedbackMessageProps) {
  const Icon = toneIcons[tone];

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={cn(
        "flex items-start font-semibold",
        variant === "banner"
          ? "gap-3 rounded-xl border px-4 py-3 text-sm"
          : "gap-1.5 text-xs",
        variant === "banner" && toneStyles[tone],
        variant === "inline" &&
          (tone === "error"
            ? "text-red-600"
            : tone === "success"
              ? "text-emerald-700"
              : "text-slate-500"),
        className,
      )}
    >
      <Icon
        className={cn(
          "shrink-0",
          variant === "banner" ? "mt-0.5 size-5" : "size-4",
          tone === "loading" && "animate-spin motion-reduce:animate-none",
        )}
        aria-hidden="true"
      />
      <span className="min-w-0">{children}</span>
    </div>
  );
}
