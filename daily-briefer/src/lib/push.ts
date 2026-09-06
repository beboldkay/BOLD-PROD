import webpush from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Digest, InboxItem, TimelineItem } from "./types";

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

let configured = false;

function configure(): boolean {
  if (configured) return true;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@example.com",
    publicKey,
    privateKey,
  );
  configured = true;
  return true;
}

/** Fan a notification out to every device this user has subscribed, pruning
 *  endpoints the push service has retired (404/410). */
export async function sendPushToUser(
  admin: SupabaseClient,
  userId: string,
  payload: PushPayload,
): Promise<number> {
  if (!configure()) return 0;

  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (!subs?.length) return 0;

  const dead: string[] = [];
  let sent = 0;

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload),
          { TTL: 6 * 60 * 60 },
        );
        sent += 1;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) dead.push(sub.id);
      }
    }),
  );

  if (dead.length) await admin.from("push_subscriptions").delete().in("id", dead);
  return sent;
}

/**
 * What, if anything, is worth waking the phone for — and a fingerprint of it.
 *
 * The rule from the brief: push only for genuinely urgent items, never for a
 * routine refresh. Comparing the signature against the one we stored last run
 * means the same urgent item notifies once, not every two hours.
 */
export function urgentSummary(digest: Digest): { signature: string; payload: PushPayload } | null {
  const urgentProjects = digest.timeline.filter(
    (t: TimelineItem) => t.chip === "urgent" && t.days !== null && t.days >= 0,
  );
  const urgentMail = digest.inbox.filter((m: InboxItem) => m.urgent);

  if (!urgentProjects.length && !urgentMail.length) return null;

  const signature = [
    ...urgentProjects.map((p) => `p:${p.id}:${p.days}`),
    ...urgentMail.map((m) => `m:${m.id}`),
  ]
    .sort()
    .join("|");

  const lines: string[] = [];
  for (const p of urgentProjects.slice(0, 2)) {
    lines.push(p.days === 0 ? `${p.title} — היום` : `${p.title} — עוד ${p.days} ימים`);
  }
  for (const m of urgentMail.slice(0, 2)) {
    lines.push(`${m.who} מחכה לתשובה`);
  }

  return {
    signature,
    payload: {
      title: "יש משהו שדורש תשומת לב",
      body: lines.join(" · "),
      url: "/",
      tag: "bold-urgent",
    },
  };
}
