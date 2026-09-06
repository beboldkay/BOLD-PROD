"use client";

import type { InboxItem } from "@/lib/types";

export default function InboxPanel({
  items,
  noise,
  connected,
}: {
  items: InboxItem[];
  noise: string;
  connected: boolean;
}) {
  return (
    <div className="panel">
      <div className="panel-head">
        <h2>אותות מהדואר</h2>
        <span className="count">{items.length ? `${items.length} פריטים אמיתיים` : "—"}</span>
      </div>
      <div className="inbox">
        {items.length === 0 ? (
          <p className="task-empty">
            {connected
              ? "כרגע שום דבר לא דורש מענה."
              : "הדואר עוד לא מחובר. התחבר עם Google כדי לראות כאן רק את מה שבאמת דורש תשובה."}
          </p>
        ) : (
          items.map((m) => (
            /* Everything below is attacker-controlled text from an inbox, so it
               goes through JSX interpolation only — never dangerouslySetInnerHTML. */
            <div className="iitem" key={m.id}>
              <div className="irow">
                <span className="who">{m.who}</span>
                <span className="age">{m.age}</span>
              </div>
              {m.subject && (
                <div className="isubject">
                  {m.link ? (
                    <a href={m.link} target="_blank" rel="noopener noreferrer">
                      {m.subject}
                    </a>
                  ) : (
                    m.subject
                  )}
                </div>
              )}
              <p className="iask">
                {m.urgent && <span className="iflag">מחכה לך · </span>}
                {m.ask}
              </p>
            </div>
          ))
        )}
      </div>
      {noise && <div className="noise">{noise}</div>}
    </div>
  );
}
