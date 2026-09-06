import { googleFetch } from "./google";
import { compactAge } from "./dates";
import type { InboxItem } from "./types";

/** Broad "real mail" query. Gmail's own category filters do most of the work of
 *  stripping newsletters and promos; the scoring below handles the rest. */
const SIGNAL_QUERY =
  "in:inbox newer_than:14d -category:promotions -category:social -category:forums -category:updates";
const ALL_QUERY = "in:inbox newer_than:14d";

const MAX_SCANNED = 30;
const MAX_SIGNALS = 6;
const KEEP_SCORE = 3;

/** Senders that are never asking you for anything. */
const MACHINE_SENDER =
  /(^|[.\-_])(no-?reply|donotreply|do-not-reply|notification|notifications|mailer-daemon|postmaster|bounce|automated|alerts?|billing|support|info|newsletter)(@|[.\-_]|$)/i;

/** Phrasing that usually means a person wants something back from you. */
const ASK_PATTERN = new RegExp(
  [
    // Hebrew
    "תוכל", "תוכלי", "אפשר", "מתי", "כמה", "בבקשה", "נא ל", "מחכה", "ממתין", "מחכים",
    "אישור", "לאשר", "הצעת מחיר", "הצעה", "חוזה", "חשבונית", "תשלום", "דדליין", "דחוף",
    "צריך ממך", "תחזור אליי", "תעדכן",
    // English
    "could you", "can you", "would you", "please", "confirm", "approve", "quote",
    "invoice", "deadline", "waiting", "follow up", "asap", "urgent", "let me know",
  ].join("|"),
  "i",
);

const URGENT_PATTERN = /(דחוף|בהול|היום|asap|urgent|eod|today)/i;

interface GmailListResponse {
  messages?: { id: string; threadId: string }[];
  resultSizeEstimate?: number;
}

interface GmailMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  internalDate?: string;
  payload?: { headers?: { name: string; value: string }[] };
}

function header(msg: GmailMessage, name: string): string {
  const found = msg.payload?.headers?.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return found?.value ?? "";
}

/** "Boaz Levi <boaz@catchdi.com>" → { name: "Boaz Levi", email: "boaz@catchdi.com" } */
function parseFrom(raw: string): { name: string; email: string } {
  const angled = raw.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  const email = (angled ? angled[2] : raw).trim().toLowerCase();
  let name = (angled ? angled[1] : "").replace(/^["']|["']$/g, "").trim();
  if (!name) name = email.split("@")[0].replace(/[._-]+/g, " ");
  return { name, email };
}

/** Gmail snippets arrive HTML-escaped and full of layout whitespace. */
function cleanSnippet(snippet: string, limit = 150): string {
  const text = snippet
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > limit ? `${text.slice(0, limit).trimEnd()}…` : text;
}

export interface MailSignals {
  items: InboxItem[];
  noise: string;
  /** Everything scanned, including what we filtered out — used for the noise line. */
  scanned: number;
}

/**
 * Pull the handful of emails that actually want a reply out of an inbox that is
 * mostly newsletters. Read-only: needs nothing beyond `gmail.readonly`.
 */
export async function fetchMailSignals(accessToken: string, myEmail: string): Promise<MailSignals> {
  const list = await googleFetch<GmailListResponse>(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${MAX_SCANNED}&q=${encodeURIComponent(SIGNAL_QUERY)}`,
    accessToken,
  );

  const ids = (list.messages ?? []).map((m) => m.id);
  const messages = await Promise.all(
    ids.map((id) =>
      googleFetch<GmailMessage>(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata` +
          ["From", "To", "Cc", "Subject", "Date", "List-Unsubscribe"]
            .map((h) => `&metadataHeaders=${h}`)
            .join(""),
        accessToken,
      ).catch(() => null),
    ),
  );

  const now = new Date();
  const me = myEmail.toLowerCase();

  const scored = messages
    .filter((m): m is GmailMessage => m !== null)
    .map((msg) => {
      const { name, email } = parseFrom(header(msg, "From"));
      const subject = header(msg, "Subject").trim();
      const snippet = cleanSnippet(msg.snippet ?? "");
      const labels = msg.labelIds ?? [];
      const haystack = `${subject} ${snippet}`;

      // Hard exclusions — bulk mail and robots never make the cut.
      if (header(msg, "List-Unsubscribe")) return null;
      if (MACHINE_SENDER.test(email)) return null;
      if (email === me) return null;

      let score = 0;
      if (labels.includes("UNREAD")) score += 3;
      if (labels.includes("IMPORTANT")) score += 2;
      if (labels.includes("STARRED")) score += 2;
      if (/[?？]/.test(haystack)) score += 2;
      if (ASK_PATTERN.test(haystack)) score += 2;
      // Addressed to you directly beats being one of twenty on the Cc line.
      if (header(msg, "To").toLowerCase().includes(me)) score += 2;

      if (score < KEEP_SCORE) return null;

      const receivedIso = new Date(Number(msg.internalDate ?? Date.now())).toISOString();
      const ageDays = (now.getTime() - Number(msg.internalDate ?? Date.now())) / 86_400_000;
      const urgent = URGENT_PATTERN.test(haystack) || (score >= 6 && ageDays >= 2);

      const item: InboxItem = {
        id: msg.id,
        who: name,
        age: compactAge(receivedIso, now),
        subject,
        ask: snippet || "אין תצוגה מקדימה להודעה הזו.",
        urgent,
        link: `https://mail.google.com/mail/u/0/#inbox/${msg.threadId}`,
      };
      return { item, score, received: Number(msg.internalDate ?? 0) };
    })
    .filter((x): x is { item: InboxItem; score: number; received: number } => x !== null)
    .sort((a, b) => b.score - a.score || b.received - a.received)
    .slice(0, MAX_SIGNALS);

  // Approximate volume of everything else, for the "and the rest is noise" line.
  const all = await googleFetch<GmailListResponse>(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=1&q=${encodeURIComponent(ALL_QUERY)}`,
    accessToken,
  ).catch(() => ({ resultSizeEstimate: 0 }) as GmailListResponse);

  const total = all.resultSizeEstimate ?? 0;
  const rest = Math.max(0, total - scored.length);
  const noise = rest
    ? `עוד כ-${rest} הודעות נכנסו בשבועיים האחרונים ולא דורשות ממך כלום — ניוזלטרים, עדכונים ופרסומות. השארתי אותן בחוץ.`
    : "";

  return { items: scored.map((s) => s.item), noise, scanned: total };
}
