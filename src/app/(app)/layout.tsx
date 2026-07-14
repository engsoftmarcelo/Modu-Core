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
    <div className="min-h-screen">
      <Sidebar organizationName={identity.organizationName} />
      <div className="lg:pl-72">
        <Topbar fullName={identity.fullName} email={identity.email} />
        <main className="mx-auto min-w-0 w-full max-w-[1600px] px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
          {children}
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}
