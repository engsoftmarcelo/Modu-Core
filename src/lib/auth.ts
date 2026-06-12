import { cache } from "react";

import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type WorkspaceIdentity = {
  userId: string;
  email: string;
  fullName: string;
  organizationId: string;
  organizationName: string;
};

export const getWorkspaceIdentity = cache(
  async function getWorkspaceIdentity(): Promise<WorkspaceIdentity | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: profile } = await supabase
      .from("users")
      .select("full_name, organization_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.organization_id) {
      return null;
    }

    let organizationName = "Minha empresa";

    const { data: organization } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", profile.organization_id)
      .maybeSingle();

    organizationName = organization?.name ?? organizationName;

    const email =
      typeof user.email === "string" ? user.email : "usuario@moducore.com";

    return {
      userId: user.id,
      email,
      fullName:
        profile.full_name ??
        (typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : email.split("@")[0]),
      organizationId: profile.organization_id,
      organizationName,
    };
  },
);
