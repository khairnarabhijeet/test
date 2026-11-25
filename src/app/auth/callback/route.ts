import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { PENDING_MOBILE_COOKIE } from "@/lib/auth/pending-mobile";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();
    const { url, key } = getSupabaseConfig();
    const supabase = createServerClient(
      url,
      key,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          },
        },
      },
    );

    const { data, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Google OAuth code exchange failed", {
        status: exchangeError.status,
        message: exchangeError.message,
      });
      return NextResponse.redirect(`${origin}/?error=auth`);
    }

    if (!data.user) {
      console.error("Google OAuth code exchange returned no user");
      return NextResponse.redirect(`${origin}/?error=auth`);
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Google OAuth profile lookup failed", {
        code: profileError.code,
        message: profileError.message,
      });
      return NextResponse.redirect(`${origin}/?error=profile_lookup`);
    }

    if (profile) {
      cookieStore.delete(PENDING_MOBILE_COOKIE);
    }

    return NextResponse.redirect(
      `${origin}${profile ? "/search" : "/complete-profile"}`,
    );
  }

  return NextResponse.redirect(`${origin}/?error=auth`);
}
