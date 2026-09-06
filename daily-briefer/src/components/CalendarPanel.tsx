"use client";

import { Fragment } from "react";
import type { CalendarItem } from "@/lib/types";

export default function CalendarPanel({
  events,
  connected,
}: {
  events: CalendarItem[];
  connected: boolean;
}) {
  const today = events.filter((e) => e.day !== "tomorrow");
  const tomorrow = events.filter((e) => e.day === "tomorrow");

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>היום ומחר</h2>
        <span className="count">{events.length ? `${events.length} אירועים` : "—"}</span>
      </div>
      <div className="cal-mini">
        {events.length === 0 ? (
          <p className="cal-empty">
            {connected
              ? "אין אירועים ביומן להיום ולמחר."
              : "היומן עוד לא מחובר. התחבר עם Google כדי שהאירועים האמיתיים יופיעו כאן."}
          </p>
        ) : (
          <>
            {today.map((e, i) => (
              <div className="cal-row" key={`t-${i}`}>
                <span className="cal-time">{e.time}</span>
                <span>{e.title}</span>
              </div>
            ))}
            {tomorrow.length > 0 && (
              <Fragment>
                <div className="cal-daybreak">מחר</div>
                {tomorrow.map((e, i) => (
                  <div className="cal-row" key={`m-${i}`}>
                    <span className="cal-time">{e.time}</span>
                    <span>{e.title}</span>
                  </div>
                ))}
              </Fragment>
            )}
          </>
        )}
      </div>
    </div>
  );
}
