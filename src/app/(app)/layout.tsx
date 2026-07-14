import { redirect } from "next/navigation";

import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getWorkspaceIdentity } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const identity = await getWorkspaceIdentity();

  if (!identity) {
    redirect("/login");
  }

  return (
    <div className="app-shell min-h-screen bg-[#f7f8fa]">
      <Sidebar organizationName={identity.organizationName} />
      <div className="lg:pl-64">
        <Topbar
          fullName={identity.fullName}
          email={identity.email}
          organizationName={identity.organizationName}
        />
        <main className="mx-auto w-full min-w-0 max-w-[1520px] px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-7">
          {children}
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}
