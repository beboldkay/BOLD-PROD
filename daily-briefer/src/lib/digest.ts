import type { SupabaseClient } from "@supabase/supabase-js";

import { accessTokenFromRefresh } from "./google";
import { fetchCalendar } from "./calendar";
import { fetchMailSignals } from "./gmail";
import { buildTimeline } from "./projects";
import { sendPushToUser, urgentSummary } from "./push";
import type { CalendarItem, Digest, InboxItem, TaskCategory, TimelineItem } from "./types";

/** Never suggest more than this many new tasks in one run — the list is meant
 *  to be readable, not a firehose. */
const MAX_NEW_SEEDS = 6;
const MAX_TASK_LEN = 280;

export interface DigestResult {
  userId: string;
  ok: boolean;
  google: boolean;
  calendar: number;
  inbox: number;
  timeline: number;
  seeded: number;
  pushed: number;
  error?: string;
}

interface SeedTask {
  text: string;
  category: TaskCategory;
  seedKey: string;
}

function truncate(text: string): string {
  return text.length > MAX_TASK_LEN ? `${text.slice(0, MAX_TASK_LEN - 1)}…` : text;
}

/** Suggestions derived from the freshly-computed digest. The seed_key is stable
 *  per project / per mail thread, so re-running never produces a duplicate. */
function buildSeeds(timeline: TimelineItem[], inbox: InboxItem[]): SeedTask[] {
  const seeds: SeedTask[] = [];

  for (const p of timeline) {
    if (p.days === null || p.days < 0) continue;
    if (p.chip !== "urgent" && p.chip !== "soon") continue;
    const when = p.days === 0 ? "היום" : p.days === 1 ? "מחר" : `עוד ${p.days} ימים`;
    seeds.push({
      text: truncate(`לקדם: ${p.title} — ${when}`),
      category: "work",
      seedKey: `proj:${p.id}`,
    });
  }

  for (const m of inbox) {
    if (!m.urgent) continue;
    const subject = m.subject ? ` — "${m.subject}"` : "";
    seeds.push({
      text: truncate(`לענות ל${m.who}${subject}`),
      category: "work",
      seedKey: `mail:${m.id}`,
    });
  }

  return seeds.slice(0, MAX_NEW_SEEDS);
}

/**
 * Rebuild one user's digest: projects from data/projects.json, plus Gmail and
 * Calendar when Google is connected. Writes digest, adds any genuinely new
 * suggested tasks, and pushes only when something urgent changed.
 *
 * Failure of any one source degrades that panel rather than the whole run.
 */
export async function runDigestForUser(
  admin: SupabaseClient,
  user: { id: string; email: string },
): Promise<DigestResult> {
  const result: DigestResult = {
    userId: user.id,
    ok: true,
    google: false,
    calendar: 0,
    inbox: 0,
    timeline: 0,
    seeded: 0,
    pushed: 0,
  };

  const timeline = buildTimeline();
  result.timeline = timeline.length;

  let calendarToday: CalendarItem[] = [];
  let inbox: InboxItem[] = [];
  let noise = "";
  const problems: string[] = [];

  const { data: tokenRow } = await admin
    .from("google_tokens")
    .select("refresh_token")
    .eq("user_id", user.id)
    .maybeSingle();

  if (tokenRow?.refresh_token) {
    try {
      const accessToken = await accessTokenFromRefresh(tokenRow.refresh_token);
      result.google = true;

      // Independent so one broken scope can't blank the other panel.
      const [cal, mail] = await Promise.allSettled([
        fetchCalendar(accessToken),
        fetchMailSignals(accessToken, user.email),
      ]);

      if (cal.status === "fulfilled") calendarToday = cal.value;
      else problems.push(`calendar: ${String(cal.reason).slice(0, 200)}`);

      if (mail.status === "fulfilled") {
        inbox = mail.value.items;
        noise = mail.value.noise;
      } else {
        problems.push(`gmail: ${String(mail.reason).slice(0, 200)}`);
      }
    } catch (err) {
      problems.push(`google auth: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  result.calendar = calendarToday.length;
  result.inbox = inbox.length;

  const digest: Digest = {
    refreshedAt: new Date().toISOString(),
    calendarToday,
    timeline,
    inbox,
    noise,
  };

  // ─── Push decision, made before we overwrite the stored signature ─────────
  const { data: prev } = await admin
    .from("digest")
    .select("push_signature")
    .eq("user_id", user.id)
    .maybeSingle();

  const urgent = urgentSummary(digest);
  const shouldPush = urgent !== null && urgent.signature !== prev?.push_signature;

  const { error: digestError } = await admin.from("digest").upsert(
    {
      user_id: user.id,
      refreshed_at: digest.refreshedAt,
      calendar_today: digest.calendarToday,
      timeline: digest.timeline,
      inbox: digest.inbox,
      noise: digest.noise,
      push_signature: urgent ? urgent.signature : null,
      last_error: problems.length ? problems.join(" | ") : null,
    },
    { onConflict: "user_id" },
  );

  if (digestError) {
    result.ok = false;
    result.error = digestError.message;
    return result;
  }

  // ─── Suggested tasks: insert-only, never update, never delete ─────────────
  const seeds = buildSeeds(timeline, inbox);
  if (seeds.length) {
    const { data: inserted, error: seedError } = await admin
      .from("tasks")
      .upsert(
        seeds.map((s) => ({
          user_id: user.id,
          text: s.text,
          done: false,
          source: "seed" as const,
          category: s.category,
          seed_key: s.seedKey,
        })),
        { onConflict: "user_id,seed_key", ignoreDuplicates: true },
      )
      .select("id");

    if (seedError) problems.push(`seeds: ${seedError.message}`);
    else result.seeded = inserted?.length ?? 0;
  }

  if (shouldPush && urgent) {
    result.pushed = await sendPushToUser(admin, user.id, urgent.payload).catch(() => 0);
  }

  if (problems.length) {
    result.error = problems.join(" | ");
    result.ok = false;
  }
  return result;
}
