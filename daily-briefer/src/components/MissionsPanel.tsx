"use client";

import { useState } from "react";
import { CheckMark } from "./Icons";
import type { Task, TaskCategory } from "@/lib/types";

interface Props {
  tasks: Task[];
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
  onAdd: (text: string, category: TaskCategory) => void;
}

function TaskRow({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: (t: Task) => void;
  onDelete: (t: Task) => void;
}) {
  return (
    <div className="task-row">
      <button
        className={`task-check${task.done ? " checked" : ""}`}
        role="checkbox"
        aria-checked={task.done}
        aria-label={task.text}
        onClick={() => onToggle(task)}
      >
        <CheckMark />
      </button>
      <div className={`task-text${task.done ? " checked" : ""}`}>
        {task.text}
        {task.source === "seed" && <span className="task-src">מוצע</span>}
      </div>
      <button className="task-del" aria-label="מחיקה" onClick={() => onDelete(task)}>
        ×
      </button>
    </div>
  );
}

export default function MissionsPanel({ tasks, onToggle, onDelete, onAdd }: Props) {
  const [draft, setDraft] = useState("");

  const work = tasks.filter((t) => t.category === "work");
  const personal = tasks.filter((t) => t.category === "personal");
  const open = tasks.filter((t) => !t.done).length;
  const done = tasks.length - open;

  const submit = (category: TaskCategory) => {
    const text = draft.trim();
    if (!text) return;
    onAdd(text, category);
    setDraft("");
  };

  const group = (title: string, list: Task[]) => {
    if (!list.length) return null;
    // Done items sink to the bottom of their own group, order otherwise stable.
    const sorted = [...list].sort((a, b) => Number(a.done) - Number(b.done));
    return (
      <div className="mission-group">
        <h3>{title}</h3>
        {sorted.map((t) => (
          <TaskRow key={t.id} task={t} onToggle={onToggle} onDelete={onDelete} />
        ))}
      </div>
    );
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>משימות</h2>
        <span className="count">
          {tasks.length ? `${open} פתוחות${done ? ` · ${done} בוצעו` : ""}` : "0 פתוחות"}
        </span>
      </div>
      <div className="missions">
        {tasks.length === 0 ? (
          <p className="task-empty">
            אין כרגע כלום ברשימה. אפשר להוסיף למטה, או לבדוק שוב אחרי הריענון.
          </p>
        ) : (
          <>
            {group("עבודה", work)}
            {group("אישי", personal)}
          </>
        )}

        <div className="task-add">
          <input
            type="text"
            value={draft}
            maxLength={140}
            placeholder="הוסף משהו לרשימה…"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit("work");
            }}
          />
          <div className="task-add-btns">
            <button disabled={!draft.trim()} onClick={() => submit("work")}>
              להוסיף לעבודה
            </button>
            <button className="alt" disabled={!draft.trim()} onClick={() => submit("personal")}>
              להוסיף לאישי
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
