import { googleFetch } from "./google";
import { eventTime, localInstant, todayKey, dayBefore } from "./dates";
import type { CalendarItem } from "./types";

interface CalendarEvent {
  id: string;
  summary?: string;
  status?: string;
  start?: { dateTime?: string; date?: string };
}

interface CalendarResponse {
  items?: CalendarEvent[];
}

/** Today + tomorrow from the primary calendar, in local (Asia/Jerusalem) time.
 *  Read-only: needs nothing beyond `calendar.readonly`. */
export async function fetchCalendar(accessToken: string): Promise<CalendarItem[]> {
  const now = new Date();
  const today = todayKey(now);
  // dayBefore(key, -1) walks forward a day, reusing the same DST-safe helper.
  const tomorrow = dayBefore(today, -1);

  const params = new URLSearchParams({
    timeMin: localInstant(today, "00:00:00", now),
    timeMax: localInstant(tomorrow, "23:59:59", now),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "25",
  });

  const res = await googleFetch<CalendarResponse>(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    accessToken,
  );

  return (res.items ?? [])
    .filter((e) => e.status !== "cancelled" && e.start)
    .map((e) => {
      const startDay = (e.start!.dateTime ?? e.start!.date ?? "").slice(0, 10);
      return {
        time: eventTime(e.start!),
        title: e.summary?.trim() || "(ללא כותרת)",
        day: startDay === today ? ("today" as const) : ("tomorrow" as const),
      };
    });
}
