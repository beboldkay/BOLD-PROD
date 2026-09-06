"use client";

import { createClient } from "./supabase/client";
import { GOOGLE_SCOPE_STRING } from "./google";

/**
 * Start Google OAuth. Two details matter and are easy to lose:
 *
 *  - `access_type: offline` + `prompt: consent` are what make Google hand back a
 *    *refresh* token. Without them the cron job has nothing to work with, and
 *    Google only re-issues one when consent is re-shown.
 *  - the Gmail/Calendar scopes are requested here, not in the Supabase
 *    dashboard, so the same sign-in both authenticates and authorises.
 */
export async function signInWithGoogle(nextPath = "/") {
  const supabase = createClient();
  const origin = window.location.origin;

  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      scopes: GOOGLE_SCOPE_STRING,
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });
}
