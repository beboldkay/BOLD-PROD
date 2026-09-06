import { TZ } from "./types";

/** Local (Asia/Jerusalem) calendar day as YYYY-MM-DD — the check-in row key.
 *  Identical semantics to the Artifact's todayKey(), which is what makes the
 *  strip reset at local midnight rather than UTC midnight. */
export function todayKey(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** The key `n` days before `key`. Midday anchor avoids DST edge cases. */
export function dayBefore(key: string, n: number): string {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return todayKey(d);
}

export function greetingWord(now: Date = new Date()): string {
  const h = parseInt(
    new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hour12: false }).format(now),
    10,
  );
  if (h < 5) return "לילה טוב";
  if (h < 12) return "בוקר טוב";
  if (h < 18) return "צהריים טובים";
  return "ערב טוב";
}

export function formatRefreshed(iso: string | null): string {
  if (!iso) return "— —";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const day = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  return `${day} · ${time}`;
}

/** "3h" / "2d" — compact, rendered LTR in the mono face. */
export function compactAge(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.max(0, Math.round((now.getTime() - then) / 60000));
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

/** Whole days from today (Asia/Jerusalem) until an ISO date. Past → negative. */
export function daysUntil(isoDate: string, now: Date = new Date()): number | null {
  if (!isoDate) return null;
  const target = new Date(`${isoDate.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date(`${todayKey(now)}T12:00:00Z`);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/** Milliseconds until the next Asia/Jerusalem midnight, so a page left open
 *  overnight rolls onto the new day's check-in row by itself. */
export function msUntilLocalMidnight(now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parseInt(parts.find((p) => p.type === t)?.value ?? "0", 10);
  const elapsed = get("hour") * 3600 + get("minute") * 60 + get("second");
  // +2s of slack so we land safely on the far side of midnight.
  return (86_400 - elapsed) * 1000 + 2000;
}

/** "HH:MM" in local time, or a Hebrew label for all-day events. */
export function eventTime(start: { dateTime?: string; date?: string }): string {
  if (start.dateTime) {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: TZ,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(start.dateTime));
  }
  return "כל היום";
}

/** Current UTC offset for Asia/Jerusalem as "+03:00" — DST-aware, so we can
 *  build exact local-midnight timestamps for the Calendar query. */
export function tzOffset(now: Date = new Date()): string {
  const name = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, timeZoneName: "longOffset" })
    .formatToParts(now)
    .find((p) => p.type === "timeZoneName")?.value;
  const match = name?.match(/GMT([+-]\d{2}:\d{2})/);
  return match ? match[1] : "+00:00";
}

/** An RFC3339 instant for a wall-clock time on a local calendar day. */
export function localInstant(dateKey: string, wallClock: string, now: Date = new Date()): string {
  return `${dateKey}T${wallClock}${tzOffset(now)}`;
}
