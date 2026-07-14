import { MessageCircle } from "lucide-react";

export function MobileWhatsAppCta({
  href,
  label = "Chamar no WhatsApp",
}: {
  href: string;
  label?: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-emerald-500/20 bg-white/95 px-4 pb-4 pt-3 shadow-2xl shadow-emerald-950/20 backdrop-blur sm:hidden print:hidden">
      <a
        data-mobile-whatsapp-cta="true"
        href={href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-base font-black text-white transition hover:bg-emerald-800"
      >
        <MessageCircle className="size-5" />
        {label}
      </a>
    </div>
  );
}
