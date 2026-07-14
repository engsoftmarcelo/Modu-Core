"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import { workOrderDemoCustomer } from "./defaults";

export async function prepareWorkOrderDemoAction() {
  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: existingCustomer, error: lookupError } = await supabase
    .from("customers")
    .select("id")
    .eq("organization_id", identity.organizationId)
    .eq("email", workOrderDemoCustomer.email)
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    redirect("/ordens-servico/demo?setup=error");
  }

  let customerId = existingCustomer?.id;

  if (!customerId) {
    const { data, error } = await supabase
      .from("customers")
      .insert({
        organization_id: identity.organizationId,
        name: workOrderDemoCustomer.name,
        company: workOrderDemoCustomer.company,
        email: workOrderDemoCustomer.email,
        phone: workOrderDemoCustomer.phone,
        whatsapp: workOrderDemoCustomer.whatsapp,
        segment: workOrderDemoCustomer.segment,
        notes: workOrderDemoCustomer.notes,
        status: "active",
      })
      .select("id")
      .single();

    if (error || !data) {
      redirect("/ordens-servico/demo?setup=error");
    }

    customerId = data.id;
    revalidatePath("/crm");
  }

  redirect(`/ordens-servico/novo?demo=1&customerId=${customerId}`);
}
