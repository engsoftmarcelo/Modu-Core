import { NextResponse, type NextRequest } from "next/server";

import { isSupabaseConfigured } from "@/lib/env";
import { getSafeInternalPath } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const safeNextPath = getSafeInternalPath(
    request.nextUrl.searchParams.get("next"),
  );

  if (code && isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(safeNextPath, request.url));
    }
  }

  return NextResponse.redirect(new URL("/login?error=callback", request.url));
}
