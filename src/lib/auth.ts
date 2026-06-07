import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type WorkspaceIdentity = {
  userId: string;
  email: string;
  fullName: string;
  organizationId: string | null;
  organizationName: string;
};

export async function getWorkspaceIdentity(): Promise<WorkspaceIdentity | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims?.sub) {
    return null;
  }

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, organization_id")
    .eq("id", claims.sub)
    .maybeSingle();

  let organizationName = "Minha empresa";

  if (profile?.organization_id) {
    const { data: organization } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", profile.organization_id)
      .maybeSingle();

    organizationName = organization?.name ?? organizationName;
  }

  const email =
    typeof claims.email === "string" ? claims.email : "usuario@moducore.com";

  return {
    userId: claims.sub,
    email,
    fullName:
      profile?.full_name ??
      (typeof claims.user_metadata?.full_name === "string"
        ? claims.user_metadata.full_name
        : email.split("@")[0]),
    organizationId: profile?.organization_id ?? null,
    organizationName,
  };
}
