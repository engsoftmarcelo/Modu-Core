import { Home, Settings, type LucideIcon } from "lucide-react";

import { modules } from "@/features/modules";

export type NavigationItem = {
  name: string;
  shortName?: string;
  href: string;
  icon: LucideIcon;
};

export const primaryNavigation: NavigationItem[] = [
  {
    name: "Inicio",
    href: "/inicio",
    icon: Home,
  },
  ...modules.map(({ name, shortName, href, icon }) => ({
    name,
    shortName,
    href,
    icon,
  })),
];

export const utilityNavigation: NavigationItem[] = [
  {
    name: "Configuracoes",
    href: "/configuracoes",
    icon: Settings,
  },
];

const mobilePrimaryHrefs = new Set([
  "/inicio",
  "/dashboard",
  "/crm",
  "/agenda",
]);

export const mobileNavigation: NavigationItem[] = [
  ...primaryNavigation.filter((item) => mobilePrimaryHrefs.has(item.href)),
];

export const mobileMoreNavigation: NavigationItem[] = [
  ...primaryNavigation.filter((item) => !mobilePrimaryHrefs.has(item.href)),
  ...utilityNavigation,
];
