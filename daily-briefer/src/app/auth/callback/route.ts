import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Comma-separated allowlist. An empty value means "anyone with a Google
 *  account", which is almost never what you want for a personal app. */
function isAllowed(email: string | undefined): boolean {
  const raw = process.env.ALLOWED_EMAILS?.trim();
  if (!raw) return true;
  const allowed = raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  return !!email && allowed.includes(email.toLowerCase());
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || url.origin;
  const next = url.searchParams.get("next") || "/";
  const fail = (reason: string) => NextResponse.redirect(`${origin}/login?error=${reason}`);

  if (url.searchParams.get("error")) return fail(url.searchParams.get("error")!);

  const code = url.searchParams.get("code");
  if (!code) return fail("no_code");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.session?.user) return fail("exchange_failed");

  const user = data.session.user;
  if (!isAllowed(user.email)) {
    await supabase.auth.signOut();
    return fail("not_allowed");
  }

  const admin = createAdminClient();

  /* Google only returns a refresh token when consent is freshly granted
     (access_type=offline + prompt=consent). Persist it the one time we see it —
     it is what lets the cron job read mail with nobody signed in. */
  const refreshToken = data.session.provider_refresh_token;
  if (refreshToken) {
    await admin.from("google_tokens").upsert(
      {
        user_id: user.id,
        refresh_token: refreshToken,
        scope: "gmail.readonly calendar.readonly",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  }

  // Make sure a digest row exists so the dashboard has something to subscribe to.
  await admin.from("digest").upsert({ user_id: user.id }, { onConflict: "user_id", ignoreDuplicates: true });

  return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : "/"}`);
}
