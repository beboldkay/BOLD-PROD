/** Shared shapes. These mirror the objects the original Artifact rendered, so
 *  the copy/markup port stays a one-to-one translation. */

export const TZ = "Asia/Jerusalem";
export const WATER_TARGET = 8;

export type Chip = "urgent" | "soon" | "track" | "watch";
export type TaskSource = "seed" | "manual";
export type TaskCategory = "work" | "personal";

export interface TimelineItem {
  id: string;
  title: string;
  /** Human date range, rendered LTR/mono, e.g. "12–14.10". */
  when: string;
  note: string;
  /** Whole days until the date, or null when the project has no date yet. */
  days: number | null;
  chip: Chip;
  chipLabel: string;
  daysLabel?: string;
  daysUnit?: string;
}

export interface InboxItem {
  id: string;
  who: string;
  /** Compact LTR age, e.g. "3h" / "2d". */
  age: string;
  subject: string;
  ask: string;
  urgent: boolean;
  /** Deep link into the Gmail thread. */
  link?: string;
}

export interface CalendarItem {
  time: string;
  title: string;
  day: "today" | "tomorrow";
}

export interface Digest {
  refreshedAt: string | null;
  calendarToday: CalendarItem[];
  timeline: TimelineItem[];
  inbox: InboxItem[];
  noise: string;
}

export interface Checkin {
  date: string;
  pills: boolean;
  water: number;
  teethAm: boolean;
  teethPm: boolean;
  clean: boolean;
}

export interface Task {
  id: string;
  text: string;
  done: boolean;
  source: TaskSource;
  category: TaskCategory;
  createdAt: string;
}

export const EMPTY_CHECKIN = (date: string): Checkin => ({
  date,
  pills: false,
  water: 0,
  teethAm: false,
  teethPm: false,
  clean: false,
});

export const EMPTY_DIGEST: Digest = {
  refreshedAt: null,
  calendarToday: [],
  timeline: [],
  inbox: [],
  noise: "",
};

/** DB row shapes (snake_case) and the mappers to the camelCase view models. */
export interface CheckinRow {
  date: string;
  pills: boolean;
  water: number;
  teeth_am: boolean;
  teeth_pm: boolean;
  clean: boolean;
}

export interface TaskRow {
  id: string;
  text: string;
  done: boolean;
  source: TaskSource;
  category: TaskCategory;
  created_at: string;
}

export interface DigestRow {
  refreshed_at: string | null;
  calendar_today: CalendarItem[] | null;
  timeline: TimelineItem[] | null;
  inbox: InboxItem[] | null;
  noise: string | null;
}

export function toCheckin(row: CheckinRow | null, fallbackDate: string): Checkin {
  if (!row) return EMPTY_CHECKIN(fallbackDate);
  return {
    date: row.date,
    pills: !!row.pills,
    water: row.water ?? 0,
    teethAm: !!row.teeth_am,
    teethPm: !!row.teeth_pm,
    clean: !!row.clean,
  };
}

export function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    text: row.text,
    done: !!row.done,
    source: row.source,
    category: row.category,
    createdAt: row.created_at,
  };
}

export function toDigest(row: DigestRow | null): Digest {
  if (!row) return EMPTY_DIGEST;
  return {
    refreshedAt: row.refreshed_at,
    calendarToday: row.calendar_today ?? [],
    timeline: row.timeline ?? [],
    inbox: row.inbox ?? [],
    noise: row.noise ?? "",
  };
}
