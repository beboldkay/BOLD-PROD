/** The exact scopes to request. Paste this list into the Google Cloud OAuth
 *  consent screen and into Supabase → Auth → Providers → Google. */
export const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/calendar.readonly",
] as const;

export const GOOGLE_SCOPE_STRING = GOOGLE_SCOPES.join(" ");

/** Trade a long-lived refresh token for a short-lived access token.
 *  This is why GOOGLE_CLIENT_ID/SECRET must exist in the app env and not only
 *  inside Supabase: the cron job refreshes on its own, with no user present. */
export async function accessTokenFromRefresh(refreshToken: string): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const body = (await res.json()) as { access_token?: string; error_description?: string; error?: string };
  if (!res.ok || !body.access_token) {
    throw new Error(
      `Google token refresh failed (${res.status}): ${body.error_description ?? body.error ?? "unknown"}`,
    );
  }
  return body.access_token;
}

/** Small helper for authenticated Google REST calls. */
export async function googleFetch<T>(url: string, accessToken: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google API ${res.status} for ${new URL(url).pathname}: ${text.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}
