const placeholderValues = ["seu-projeto", "xxxxxxxx"];

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return false;
  }

  return !placeholderValues.some(
    (placeholder) => url.includes(placeholder) || key.includes(placeholder),
  );
}

export function getSupabaseEnv() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase nao configurado. Copie .env.example para .env.local e informe as credenciais.",
    );
  }

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    publishableKey:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  };
}
