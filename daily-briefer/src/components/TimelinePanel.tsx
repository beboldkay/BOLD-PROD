"use client";

import type { TimelineItem } from "@/lib/types";

function dayColor(item: TimelineItem): string {
  if (item.chip === "urgent") return "var(--critical)";
  if (item.chip === "soon") return "var(--warn)";
  if (item.days === null) return "var(--ink-faint)";
  return "inherit";
}

export default function TimelinePanel({ items }: { items: TimelineItem[] }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <h2>ציר הפרויקטים</h2>
        <span className="count">{items.length ? `${items.length} פעילים · לפי דחיפות` : "—"}</span>
      </div>
      <div className="timeline">
        {items.length === 0 ? (
          <p className="task-empty">אין עדיין פרויקטים בתיק.</p>
        ) : (
          items.map((p) => (
            <div className="titem" key={p.id}>
              <div className="tbody">
                <span className={`chip ${p.chip}`}>{p.chipLabel}</span>
                <h3>{p.title}</h3>
                <div className="when">{p.when}</div>
                <p>{p.note}</p>
              </div>
              <div className="tdays" style={{ color: dayColor(p) }}>
                <span className="n">{p.days !== null ? p.days : (p.daysLabel ?? "·")}</span>
                <span className="u">{p.days !== null ? "ימים" : (p.daysUnit ?? "ללא תאריך")}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
