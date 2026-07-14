import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  align?: "center" | "left";
  description?: string;
  eyebrow: string;
  inverse?: boolean;
  title: string;
};

export function SectionHeading({
  align = "left",
  description,
  eyebrow,
  inverse = false,
  title,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      <p
        className={cn(
          "text-sm font-bold uppercase",
          inverse ? "text-sky-300 print:text-brand-700" : "text-brand-700",
        )}
      >
        {eyebrow}
      </p>
      <h2
        className={cn(
          "font-display mt-3 text-3xl leading-tight sm:text-4xl lg:text-5xl",
          inverse ? "text-white print:text-ink-950" : "text-ink-950",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-5 text-base leading-7 sm:text-lg",
            inverse ? "text-slate-300 print:text-slate-600" : "text-slate-600",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
