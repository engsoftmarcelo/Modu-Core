"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  status: "idle" | "error" | "success";
  message: string;
};

export const initialAuthState: AuthState = {
  status: "idle",
  message: "",
};

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function loginAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message: "Configure o Supabase no arquivo .env.local antes de entrar.",
    };
  }

  const email = getString(formData, "email").toLowerCase();
  const password = getString(formData, "password");

  if (!email || !password) {
    return {
      status: "error",
      message: "Informe seu e-mail e sua senha.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      status: "error",
      message: "E-mail ou senha invalidos. Confira os dados e tente novamente.",
    };
  }

  redirect("/inicio");
}

export async function signUpAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message: "Configure o Supabase no arquivo .env.local antes de criar a conta.",
    };
  }

  const fullName = getString(formData, "fullName");
  const companyName = getString(formData, "companyName");
  const businessModel = getString(formData, "businessModel");
  const email = getString(formData, "email").toLowerCase();
  const password = getString(formData, "password");
  const allowedModels = [
    "b2b_services",
    "appointments",
    "courses",
    "work_orders",
  ];

  if (!fullName || !companyName || !email || !password) {
    return {
      status: "error",
      message: "Preencha todos os campos obrigatorios.",
    };
  }

  if (password.length < 8) {
    return {
      status: "error",
      message: "A senha precisa ter pelo menos 8 caracteres.",
    };
  }

  if (!allowedModels.includes(businessModel)) {
    return {
      status: "error",
      message: "Selecione um modelo de negocio valido.",
    };
  }

  const requestHeaders = await headers();
  const origin =
    requestHeaders.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/inicio`,
      data: {
        full_name: fullName,
        company_name: companyName,
        business_model: businessModel,
      },
    },
  });

  if (error) {
    return {
      status: "error",
      message:
        error.code === "user_already_exists"
          ? "Ja existe uma conta com este e-mail."
          : "Nao foi possivel criar a conta. Tente novamente.",
    };
  }

  if (data.session) {
    redirect("/inicio");
  }

  return {
    status: "success",
    message:
      "Conta criada. Abra o e-mail de confirmacao para concluir o acesso.",
  };
}
