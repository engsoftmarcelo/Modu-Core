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

export const mobileNavigation: NavigationItem[] = [
  primaryNavigation[0],
  primaryNavigation.find((item) => item.href === "/dashboard")!,
  primaryNavigation.find((item) => item.href === "/crm")!,
  primaryNavigation.find((item) => item.href === "/agenda")!,
  utilityNavigation[0],
];
