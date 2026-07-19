import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/auth/reset-password`);
      }
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const { data: existing } = await supabase
          .from("users")
          .select("org_id")
          .eq("email", data.user.email)
          .maybeSingle();

        const redirectUrl = existing?.org_id ? "/dashboard" : "/onboarding";
        return NextResponse.redirect(`${origin}${redirectUrl}`);
      }
      return NextResponse.redirect(`${origin}/onboarding`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
