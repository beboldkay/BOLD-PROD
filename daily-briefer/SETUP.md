# Setup — everything you need to create, in order

Nothing in this repo talks to a real account until you do the steps below. Each
one ends with a value to paste into `.env.local` (locally) and into Vercel's
environment variables (in production).

Work through it top to bottom; step 3 depends on step 2, and step 5 depends on
step 4.

---

## 1. Supabase project

1. Create a project at <https://supabase.com/dashboard> (free tier is enough).
   Pick the region closest to Israel — **Frankfurt (eu-central-1)**.
2. **SQL Editor → New query** → paste the entire contents of
   `supabase/migrations/0001_init.sql` → **Run**. This creates the tables, the
   row-level-security policies, and the realtime publication.
3. **Project Settings → API**, copy three values:

   | Supabase field | Env var |
   |---|---|
   | Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
   | `anon` `public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
   | `service_role` `secret` key | `SUPABASE_SERVICE_ROLE_KEY` |

> The `service_role` key bypasses all row-level security. It belongs only in
> server env vars — never in a `NEXT_PUBLIC_*` name, never in the browser.

---

## 2. Google Cloud project (Gmail + Calendar)

This is the part you asked me to spell out. Do exactly this:

1. Go to <https://console.cloud.google.com/> → **Create Project** → name it
   something like `bold-daily-briefer`.

2. **APIs & Services → Library** → enable **both**:
   - **Gmail API**
   - **Google Calendar API**

3. **APIs & Services → OAuth consent screen**:
   - User type: **External**
   - App name: `יומן BOLD` (anything you like), support email: your own
   - Developer contact: your own email
   - **Scopes** — click *Add or remove scopes* and add exactly these four:

     ```
     openid
     .../auth/userinfo.email
     .../auth/userinfo.profile
     https://www.googleapis.com/auth/gmail.readonly
     https://www.googleapis.com/auth/calendar.readonly
     ```

     Both API scopes are **read-only**. The app never sends mail, never
     modifies your calendar, and never asks for a write scope.
   - **Test users** — add `kaigotlib@gmail.com`.
   - Leave the app in **Testing**. That is all you need for personal use and it
     skips Google's verification review entirely.

     > One consequence of Testing mode: Google expires the refresh token after
     > **7 days**, so you'll be asked to sign in again weekly. To stop that,
     > click **Publish app** — for a single-user app requesting only read
     > scopes on your own data, Google lets this through without review in most
     > cases; if it does prompt for verification, staying in Testing and
     > re-signing in weekly is a perfectly workable fallback.

4. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**
   - Name: `bold-briefer-web`
   - **Authorised redirect URIs** — add the callback of your *Supabase* project
     (not of this app; Supabase brokers the OAuth handshake):

     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```

   - Create, then copy **Client ID** → `GOOGLE_CLIENT_ID` and
     **Client secret** → `GOOGLE_CLIENT_SECRET`.

> Why the app *also* needs the client ID/secret in its own env: the scheduled
> digest job refreshes Google access tokens by itself, with nobody signed in.
> Supabase holds the same pair for the interactive sign-in.

---

## 3. Connect Google to Supabase Auth

In the Supabase dashboard → **Authentication → Sign In / Providers → Google**:

- Enable it.
- **Client ID** / **Client Secret**: the pair from step 2.4.
- Copy the **Callback URL** shown there and confirm it matches what you pasted
  into Google. (It is the same `.../auth/v1/callback` URL.)

Then **Authentication → URL Configuration**:

- **Site URL**: your deployed origin, e.g. `https://bold-briefer.vercel.app`
- **Redirect URLs**: add both

  ```
  https://bold-briefer.vercel.app/auth/callback
  http://localhost:3000/auth/callback
  ```

---

## 4. Web Push keys

```bash
npm run vapid
```

Paste the two printed lines into your env. Set `VAPID_SUBJECT` to
`mailto:your@email.com`.

Regenerating these invalidates every existing push subscription, so do it once.

---

## 5. Deploy to Vercel

1. Push this repo to GitHub, then **Add New → Project** on
   <https://vercel.com/> and import it.
2. **Root Directory**: `daily-briefer` (this folder — the repo root holds the
   separate marketing site).
3. **Environment Variables** — add every entry from `.env.example`:

   | Var | Notes |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | step 1 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | step 1 |
   | `SUPABASE_SERVICE_ROLE_KEY` | step 1 — server only |
   | `GOOGLE_CLIENT_ID` | step 2 |
   | `GOOGLE_CLIENT_SECRET` | step 2 — server only |
   | `NEXT_PUBLIC_SITE_URL` | your `https://…vercel.app`, no trailing slash |
   | `ALLOWED_EMAILS` | `kaigotlib@gmail.com` |
   | `CRON_SECRET` | any long random string |
   | `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | step 4 |
   | `VAPID_PRIVATE_KEY` | step 4 — server only |
   | `VAPID_SUBJECT` | `mailto:…` |

4. Deploy. `vercel.json` registers the cron automatically — check
   **Project → Cron Jobs** and you should see `/api/cron/digest` every 2 hours.
   Vercel sends `CRON_SECRET` as a bearer token on its own; you don't wire that
   up anywhere.

   > Vercel's Hobby plan allows cron jobs but runs them **once a day** at an
   > unspecified hour. If you want the true two-hourly cadence on Hobby, point
   > a free external scheduler (cron-job.org, GitHub Actions on a schedule) at
   > `https://<your-site>/api/cron/digest` with the header
   > `Authorization: Bearer <CRON_SECRET>` — the endpoint is identical.

5. Go back to Supabase → **URL Configuration** and make sure the real
   deployment URL is in both **Site URL** and **Redirect URLs**.

---

## 6. First run

1. Open the site, **כניסה עם Google**, accept the consent screen.
   Google will warn that the app is unverified — that is expected in Testing
   mode; continue.
2. The callback stores your refresh token, so the cron can read mail without
   you.
3. Fill in `data/projects.json` with your real active BOLD projects and push —
   the timeline recomputes countdowns from it on every digest run.
4. Hit **רענן עכשיו** once to populate the digest immediately instead of
   waiting for the cron.
5. **Install it on your phone**: open the site in Safari (iOS) or Chrome
   (Android) → Share → *Add to Home Screen*. Then tap **הפעל התראות** once, on
   the phone, to enable push.

   > iOS only permits Web Push from a PWA that has been added to the home
   > screen, and only on iOS 16.4+. Enabling notifications in desktop Safari
   > or in the iOS browser tab will not work — do it from the installed app.

---

## Troubleshooting

**"הדואר והיומן עוד לא מחוברים" persists after signing in.**
Google only returns a refresh token when consent is freshly granted. Sign out,
then sign in again — the app always sends `prompt=consent`, so a second pass
fixes it. If it still fails, revoke the app at
<https://myaccount.google.com/permissions> and sign in once more.

**Digest stays empty.** Call the refresh endpoint and read the response — it
reports per-source errors rather than failing silently:

```bash
curl -X POST https://<your-site>/api/digest/refresh -H "Cookie: <your session cookie>"
```

Or check `digest.last_error` in the Supabase table editor.

**Cron returns 401.** `CRON_SECRET` differs between Vercel's env and what the
scheduler sends. Re-check the value and redeploy.

**Nothing appears on another device.** Realtime needs the tables in the
`supabase_realtime` publication — re-run the last block of
`supabase/migrations/0001_init.sql`.
