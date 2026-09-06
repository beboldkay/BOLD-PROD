# BOLD Daily Briefer — handoff brief for a real, standalone app

This is the full context for continuing this project in a fresh Claude Code session on your own machine. Paste or attach this whole file first — it replaces everything I know from our conversation. `daily-briefer-source.html` in this same folder is the current working version, running today as a Claude Artifact.

## 1. The honest starting point: what changes when you leave Cowork

The app that works right now lives as a **Claude Artifact** — a hosted page with a small built-in database (`window.claude.use('db')`) that only exists inside Claude's own products. `daily-briefer-source.html` uses that API for every save (pills, water, teeth, clean-day streak, tasks). **That API will not exist in a plain web project.** Claude Code can read the file for its design and structure, but the save/load logic has to be rebuilt against a real backend. That's most of what Section 3 below is for.

Everything else — the visual design, the Hebrew/RTL layout, the data model, the copy — carries over directly.

## 2. What the app is

A personal daily organizer for Kai Gotlib (קאי גוטליב), 25, Tel Aviv — freelance creative event producer under the **BOLD** brand, invoicing through **Catch D.I.** (partner: Boaz). One page, fully Hebrew/RTL, meant to be opened like an app every morning and left running:

- **Check-in strip**: פילים (pills, one daily mark), מים (water, target 8 cups/day), צחצוח שיניים (teeth, morning + evening), יום נקי (a daily "clean day" mark — sober from GHB, tracked with a positive day-streak counter, deliberately non-clinical, non-shaming language, no red/warning colors on this tile specifically).
- **היום ומחר**: today/tomorrow calendar — not wired to real data yet (Google Calendar access wasn't turned on in the chat this was built in).
- **משימות (Missions)**: a real to-do list split into עבודה (Work) / אישי (Personal). Some tasks are suggested automatically from mail/projects (`source:"seed"`), the rest Kai adds himself.
- **ציר הפרויקטים (Project Timeline)**: his active BOLD projects, sorted by urgency, with a countdown and a status chip (urgent / soon / track / watch).
- **אותות מהדואר (Mail Signal)**: the small number of real actionable emails hiding in an inbox that's mostly newsletters/spam — filtered to just what needs a reply.

Design system already built and worth keeping: warm parchment neutral background (`#F2F1EC` light / `#17181A` dark) with a deep teal accent (`#2B5D63` / `#7CBFC3`), semantic colors kept separate from the accent (good=green, warn=amber, critical=rust, plus dedicated water/pill/teeth/clean tones). Type: **Frank Ruhl Libre** (display, Hebrew serif) + **Rubik** (body) + **IBM Plex Mono** (numbers/dates). Full tokens are in the CSS at the top of `daily-briefer-source.html` — both a light and dark palette are already defined.

## 3. Recommended architecture for the real version

A small full-stack web app, installable on the phone as a PWA (so it opens like an app with an icon, no native app-store build needed):

- **Frontend**: keep the existing HTML/CSS/JS as the starting point, or port it to a simple framework (Next.js is a reasonable default — good PWA support, easy deploy). RTL/Hebrew, the check-in tiles, and the Missions UI translate over almost as-is.
- **Backend + database**: swap `window.claude.use('db')` for a real database. Easiest options, roughly in order of setup speed:
  - **Supabase** (Postgres + auth + realtime, generous free tier) — closest replacement for what the Artifact db was doing (live updates across devices).
  - **Firebase** (Firestore) — same data-shape as what's already built (`checkins/{date}`, `tasks/{id}`, `digest/latest`), very little re-modeling needed.
- **Hosting**: Vercel or Netlify free tier. You'll get a `*.vercel.app` address automatically — no separate domain purchase needed unless you want your own.
- **Scheduled refresh**: replace the Claude scheduled task with a cron job (Vercel Cron, or a GitHub Action on a schedule) that calls a small serverless function to pull Gmail/Calendar and rewrite the digest, same as today.
- **Push notifications**: Web Push (works from a PWA, no app store needed) for the "something urgent" alerts.

## 4. Data model (carry over as-is)

```
checkins/{YYYY-MM-DD}   { pills: bool, water: number, teethAm: bool, teethPm: bool, clean: bool, date: string }
tasks/{id}              { text: string, done: bool, source: "seed"|"manual", category: "work"|"personal", createdAt: iso }
digest/latest           { refreshedAt: iso, calendarToday: [{time, title}], timeline: [...], inbox: [...], noise: string }
```
Full field shapes for `timeline` and `inbox` items are visible directly in `daily-briefer-source.html`'s `renderTimeline`/`renderInbox` functions.

## 5. Integrations — what's realistic and what isn't

| Service | Feasibility | Notes |
|---|---|---|
| **Gmail** | Easy | Official Gmail API, OAuth2, `gmail.readonly` scope is enough for reading threads. Google Cloud Console → create project → enable Gmail API → OAuth consent screen → `googleapis` npm package. |
| **Google Calendar** | Easy | Same Google Cloud project, add Calendar API + `calendar.readonly` scope. |
| **ChatGPT / "my GPT"** | Easy, but local-only | There's no API for reading your own ChatGPT conversation history live — OpenAI doesn't expose that. You already have a full local export (`~/Documents/ChatGPT Archive 2026` on your Mac, indexed in Google Drive). Treat that as a static knowledge source the app can search, not a live sync. If you separately want the app to *call* GPT (ask it questions, summarize things), that's a different, easy integration: an OpenAI API key + the `openai` npm package — but it's a paid API separate from your ChatGPT subscription. |
| **Instagram** | Hard | Meta's Graph API requires an Instagram **professional** (Business/Creator) account linked to a Facebook Page, a registered Meta Developer app, and — for anything beyond your own read-only insights — an App Review process that can take weeks. Realistic first step: read-only insights/analytics, not posting. If you just want scheduled posting, a no-code tool (Buffer, Later) is faster than building this yourself. |
| **LinkedIn** | Hard | LinkedIn's API for personal posting is heavily gated (partner-only for most useful scopes). Not realistic to automate posting yourself without a partnership agreement. A manual "post to LinkedIn" reminder in Missions is the pragmatic substitute. |
| **Xiaomi / Zepp watch** | No official API | Xiaomi doesn't publish a public consumer API for the Zepp app. Two honest paths: (1) manual entry, same pattern as pills/water; (2) **Gadgetbridge** — a well-known open-source Android app that talks to Mi Band/Zepp devices directly over Bluetooth without the cloud, and can export data locally. Worth a look if you want real automation here, but it's a separate Android-side project, not something a backend can just call. |
| **Plaud (voice notes)** | Easy | There's a real Plaud connector with `list_files`, `get_note`, `get_transcript` — same OAuth-style connector model as Gmail. Outside of Claude's connector system, Plaud's own API/export would need checking directly with Plaud. |

## 6. Suggested build order

1. Stand up the skeleton (Next.js + Supabase/Firebase + Vercel), port the existing HTML/CSS almost unchanged, wire check-ins and Missions to the real database. This alone gets you back to feature parity with today's Artifact, just self-hosted.
2. Add Gmail + Calendar via Google OAuth (both easy, both official APIs) — this replaces the scheduled Claude job with your own cron function.
3. Add Web Push for urgent-item notifications.
4. Revisit Instagram/LinkedIn/health once the core loop is solid — these are genuinely slower, so they shouldn't block getting a working daily app back.

## 7. Preferences to carry over

- Fully Hebrew, RTL.
- Strong default recommendations over long option lists; one clarifying question at a time.
- Recovery-oriented, non-shaming language anywhere health/clean-day content shows up — don't make this tile feel clinical or alarming.
- In-app editing preferred over "ask Claude to change it" for day-to-day tweaks.
- Update cadence: as close to constant as practical; push only for genuinely urgent items, not every routine refresh.
