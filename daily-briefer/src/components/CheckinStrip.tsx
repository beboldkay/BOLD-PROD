"use client";

import { CleanIcon, Drop, PillIcon, TeethIcon, WaterIcon } from "./Icons";
import { WATER_TARGET, type Checkin } from "@/lib/types";

interface Props {
  checkin: Checkin;
  streak: number | null;
  onChange: (patch: Partial<Checkin>) => void;
}

export default function CheckinStrip({ checkin, streak, onChange }: Props) {
  const { pills, water, teethAm, teethPm, clean } = checkin;
  const teethCount = (teethAm ? 1 : 0) + (teethPm ? 1 : 0);

  // Tapping the drop you're already on clears it, so a mis-tap is one tap back.
  const setWater = (index: number) =>
    onChange({ water: index + 1 === water ? index : index + 1 });

  const cleanSub =
    streak === null ? " " : streak > 0 ? `${streak} ימים ברצף` : "התחלה חדשה, וזה בסדר";

  return (
    <div className="checkin-strip">
      <div className="check-card">
        <div className="check-icon" style={{ background: "var(--pill-soft)" }}>
          <PillIcon />
        </div>
        <div className="check-body">
          <p className="check-label">כדורים</p>
          <p className="check-sub">{pills ? "נלקח היום" : "עדיין לא סומן היום"}</p>
        </div>
        <button
          className={`pill-btn${pills ? " done" : ""}`}
          aria-pressed={pills}
          onClick={() => onChange({ pills: !pills })}
        >
          {pills ? "✓ נלקח" : "סמן שנלקח"}
        </button>
      </div>

      <div className="check-card wrapping">
        <div className="check-icon" style={{ background: "var(--water-soft)" }}>
          <WaterIcon />
        </div>
        <div className="check-body">
          <p className="check-label">מים</p>
          <p className="check-sub">
            {water}
            {water > WATER_TARGET ? "+" : ""} מתוך {WATER_TARGET} כוסות
          </p>
        </div>
        <div className="water-widget">
          {Array.from({ length: WATER_TARGET }, (_, i) => (
            <button
              key={i}
              className="drop-btn"
              aria-label={`${i + 1} כוסות`}
              aria-pressed={i < water}
              onClick={() => setWater(i)}
            >
              <Drop full={i < water} />
            </button>
          ))}
        </div>
      </div>

      <div className="check-card">
        <div className="check-icon" style={{ background: "var(--teeth-soft)" }}>
          <TeethIcon />
        </div>
        <div className="check-body">
          <p className="check-label">צחצוח שיניים</p>
          <p className="check-sub">{teethCount}/2 היום</p>
        </div>
        <div className="teeth-toggles">
          <button
            className={`teeth-btn${teethAm ? " done" : ""}`}
            aria-pressed={teethAm}
            onClick={() => onChange({ teethAm: !teethAm })}
          >
            בוקר
          </button>
          <button
            className={`teeth-btn${teethPm ? " done" : ""}`}
            aria-pressed={teethPm}
            onClick={() => onChange({ teethPm: !teethPm })}
          >
            ערב
          </button>
        </div>
      </div>

      {/* Deliberately kept in the positive/clean palette — never red, never
          clinical, per the recovery-oriented language rule in the brief. */}
      <div className="check-card">
        <div className="check-icon" style={{ background: "var(--clean-soft)" }}>
          <CleanIcon />
        </div>
        <div className="check-body">
          <p className="check-label">יום נקי</p>
          <p className="check-sub">{cleanSub}</p>
        </div>
        <button
          className={`clean-btn${clean ? " done" : ""}`}
          aria-pressed={clean}
          onClick={() => onChange({ clean: !clean })}
        >
          {clean ? "✓ נקי היום" : "סמן יום נקי"}
        </button>
      </div>
    </div>
  );
}
