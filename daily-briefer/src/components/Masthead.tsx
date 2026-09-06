"use client";

import PushToggle from "./PushToggle";
import { formatRefreshed } from "@/lib/dates";

interface Props {
  greeting: string;
  live: boolean;
  refreshedAt: string | null;
  refreshing: boolean;
  onRefresh: () => void;
}

export default function Masthead({ greeting, live, refreshedAt, refreshing, onRefresh }: Props) {
  return (
    <div className="masthead">
      <div>
        <h1>{greeting}</h1>
        <div className="sub">
          כדורים, מים, שיניים, יום נקי, המשימות של היום, הדואר והפרויקטים — הכול במקום אחד.
        </div>
      </div>
      <div className="meta">
        <div>
          <span className={`dot${live ? "" : " off"}`} />
          <span>{live ? "חי" : "לא מסונכרן"}</span>
        </div>
        <div>עודכן לאחרונה — {formatRefreshed(refreshedAt)}</div>
        <div className="meta-actions">
          <button className="ghost-btn" onClick={onRefresh} disabled={refreshing}>
            {refreshing ? "מרענן…" : "רענן עכשיו"}
          </button>
          <PushToggle />
          <form action="/auth/signout" method="post">
            <button className="ghost-btn" type="submit">
              יציאה
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
