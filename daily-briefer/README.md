# BOLD Daily Briefer

The standalone version of the daily organizer that used to run as a Claude
Artifact. Same page, same Hebrew/RTL design — but on a real database, a real
Google connection, and installable on the phone as a PWA.

**New here? Read [`SETUP.md`](./SETUP.md).** It lists exactly which accounts,
keys and scopes to create, in order. Nothing works until those exist.

---

## What it does

One page, fully Hebrew/RTL, meant to be opened every morning:

- **Check-in strip** — כדורים (daily mark), מים (8 cups), צחצוח שיניים
  (morning + evening), יום נקי with a positive day-streak counter. Every mark
  saves instantly and rolls over at local midnight in Asia/Jerusalem.
- **היום ומחר** — today's and tomorrow's events from Google Calendar.
- **משימות** — a real to-do list split into עבודה / אישי. Some tasks are
  suggested automatically from mail and projects; the rest you add yourself.
- **ציר הפרויקטים** — your active BOLD projects, sorted by urgency, with a
  countdown and a status chip.
- **אותות מהדואר** — the handful of emails that actually want a reply, pulled
  out of an inbox that is mostly newsletters.

## What changed from the Artifact

| Artifact | Here |
|---|---|
| `window.claude.use('db')` | Supabase Postgres + Realtime |
| Nothing (open page) | Google sign-in, restricted to `ALLOWED_EMAILS` |
| Claude scheduled task | Vercel Cron → `/api/cron/digest` |
| Calendar not wired | Google Calendar API, `calendar.readonly` |
| Mail signals hand-written | Gmail API, `gmail.readonly`, scored heuristically |
| — | Web Push for urgent items only |
| — | Installable PWA (manifest + service worker + icons) |

The design carried over unchanged: same tokens (light *and* dark), same fonts
(Frank Ruhl Libre / Rubik / IBM Plex Mono, now self-hosted via `next/font`
instead of a CDN), same markup structure, same copy.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Supabase · Web Push · Vercel.

## Local development

```bash
npm install
cp .env.example .env.local     # fill it in — see SETUP.md
npm run dev                    # http://localhost:3000
```

Other scripts:

```bash
npm run build       # production build
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run vapid       # generate Web Push keys
npm run icons       # regenerate PWA icons (needs: npm i -D sharp)
```

## Layout

```
data/projects.json            your active projects — the only file you edit routinely
supabase/migrations/          schema, RLS policies, realtime publication
public/sw.js                  service worker: install + push
public/manifest.webmanifest   PWA manifest
src/proxy.ts                  session refresh + auth redirects (Next 16's middleware)
src/app/page.tsx              server-rendered first paint
src/app/api/cron/digest/      the scheduled rebuild
src/app/api/digest/refresh/   the same job, on demand ("רענן עכשיו")
src/lib/digest.ts             the job itself: projects + Gmail + Calendar → digest
src/lib/gmail.ts              which emails count as signal
src/lib/projects.ts           countdowns and status chips
src/components/               the UI, one component per panel
```

## Editing your projects

`data/projects.json`:

```json
{
  "projects": [
    {
      "id": "street-launch-tlv",
      "title": "השקת קמפיין רחוב — תל אביב",
      "date": "2026-09-12",
      "when": "12–14.09",
      "note": "לאשר הרשאות עירייה ולסגור צוות שטח."
    }
  ]
}
```

`id` must be unique and stable — it is what keeps the auto-suggested task for a
project from being suggested twice. `date` drives the countdown and the chip
(`urgent` ≤ 3 days, `soon` ≤ 10, `track` ≤ 30, `watch` beyond); omit it for a
project with no date yet. Anything more than a week past drops off by itself.

Changing this file needs a redeploy. If that becomes annoying, the natural next
step is to move it into a Supabase table with a small editor screen — the
digest job reads it through one function (`buildTimeline`), so that swap is
contained.

## How the digest job behaves

Every two hours (and whenever you press **רענן עכשיו**):

1. Recompute project countdowns from `data/projects.json`.
2. If Google is connected, pull today+tomorrow's calendar and scan the last 14
   days of inbox for mail that looks like it wants a reply.
3. Write `digest`, which the open page picks up over Realtime.
4. Insert *new* suggested tasks only. Each is keyed (`proj:<id>`,
   `mail:<thread>`) and inserted with `ON CONFLICT DO NOTHING`, so **a task you
   already added, edited or completed is never touched, reopened or deleted.**
5. Push a notification only if something urgent changed since the last run —
   never for a routine refresh.

A failure in one source degrades that panel only; the error lands in
`digest.last_error` and the rest of the page still updates.

## Security notes

- Row-level security is on for every table; each policy pins `user_id` to
  `auth.uid()`, so the anon key cannot read another user's rows.
- `google_tokens` has RLS enabled and **no policies at all** — only the
  service role can read it. The UI asks a `security definer` function whether a
  token exists rather than being able to see it.
- `ALLOWED_EMAILS` gates the callback, so a stranger with a Google account
  cannot create an account on your deployment.
- Everything rendered from Gmail goes through JSX interpolation; there is no
  `dangerouslySetInnerHTML` anywhere in the app.
- The service worker never caches `/api/*` or `/auth/*`.

## Deliberately not built yet

Instagram, LinkedIn and the Xiaomi/Zepp watch, per the brief — Meta and
LinkedIn both gate the useful scopes behind app review or a partnership, and
Xiaomi publishes no consumer API. The core daily loop comes first.

## Known rough edges

- `eslint` is pinned to `^9` because `eslint-config-next@16` bundles
  typescript-eslint 8, which does not yet run on ESLint 10. Likewise
  `typescript` is pinned to `^6`. Both can move up once that lands.
- Gmail's `resultSizeEstimate` is an estimate, so the "noise" count is
  approximate by design — it is phrased as `כ-` (roughly) in the UI.
- Mail scoring is heuristic, not a language model. It is tuned to
  under-promise: a missed email is better than a noisy panel. `ASK_PATTERN` and
  the score weights in `src/lib/gmail.ts` are the dials.
