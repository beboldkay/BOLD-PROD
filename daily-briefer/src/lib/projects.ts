import projectsFile from "../../data/projects.json";
import { daysUntil } from "./dates";
import type { Chip, TimelineItem } from "./types";

interface ProjectEntry {
  id: string;
  title: string;
  date?: string | null;
  when?: string | null;
  note?: string | null;
}

const CHIP_LABEL: Record<Chip, string> = {
  urgent: "דחוף",
  soon: "מתקרב",
  track: "בזמן",
  watch: "במעקב",
};

function classify(days: number | null): Chip {
  if (days === null) return "watch";
  if (days < 0) return "track";
  if (days <= 3) return "urgent";
  if (days <= 10) return "soon";
  if (days <= 30) return "track";
  return "watch";
}

/** "2026-10-12" → "12.10" — matches the mono LTR date style in the timeline. */
function humanDate(iso: string): string {
  const [, month, day] = iso.slice(0, 10).split("-");
  return `${day}.${month}`;
}

/** 0 = upcoming, 1 = just finished, 2 = no date yet. */
function rank(p: TimelineItem): number {
  if (p.days === null) return 2;
  return p.days >= 0 ? 0 : 1;
}

function within(a: TimelineItem, b: TimelineItem): number {
  if (a.days === null || b.days === null) return a.title.localeCompare(b.title, "he");
  // Upcoming: soonest first. Finished: most recent first.
  return a.days >= 0 ? a.days - b.days : b.days - a.days;
}

/**
 * Turn data/projects.json into the timeline the UI renders, sorted by urgency.
 * Anything that finished more than a week ago drops off by itself.
 */
export function buildTimeline(now: Date = new Date()): TimelineItem[] {
  const entries = (projectsFile.projects ?? []) as ProjectEntry[];

  return entries
    .map((p) => {
      const days = p.date ? daysUntil(p.date, now) : null;
      const chip = classify(days);
      return {
        id: p.id,
        title: p.title,
        when: p.when?.trim() || (p.date ? humanDate(p.date) : "טרם נקבע"),
        note: p.note?.trim() || "",
        days,
        chip,
        chipLabel: days !== null && days < 0 ? "הסתיים" : CHIP_LABEL[chip],
        daysLabel: days === null ? "·" : undefined,
        daysUnit: days === null ? "ללא תאריך" : undefined,
      } satisfies TimelineItem;
    })
    .filter((p) => p.days === null || p.days >= -7)
    /* Reading order: what's coming up (soonest first), then what just wrapped
       (most recent first — there's usually still invoicing to chase), then
       anything without a date. */
    .sort((a, b) => rank(a) - rank(b) || within(a, b));
}
