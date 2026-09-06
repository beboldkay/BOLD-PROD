"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";

import Masthead from "./Masthead";
import CheckinStrip from "./CheckinStrip";
import CalendarPanel from "./CalendarPanel";
import MissionsPanel from "./MissionsPanel";
import TimelinePanel from "./TimelinePanel";
import InboxPanel from "./InboxPanel";
import ServiceWorkerRegister from "./ServiceWorkerRegister";

import { createClient } from "@/lib/supabase/client";
import { signInWithGoogle } from "@/lib/signin";
import { dayBefore, greetingWord, msUntilLocalMidnight, todayKey } from "@/lib/dates";
import {
  EMPTY_CHECKIN,
  toCheckin,
  toDigest,
  toTask,
  type Checkin,
  type CheckinRow,
  type Digest,
  type DigestRow,
  type Task,
  type TaskCategory,
  type TaskRow,
} from "@/lib/types";

interface Props {
  userId: string;
  initialDate: string;
  initialCheckin: Checkin;
  initialTasks: Task[];
  initialDigest: Digest;
  googleConnected: boolean;
}

const STREAK_WINDOW = 60;

export default function Dashboard({
  userId,
  initialDate,
  initialCheckin,
  initialTasks,
  initialDigest,
  googleConnected,
}: Props) {
  const supabase = useMemo(() => createClient(), []);

  const [dateKey, setDateKey] = useState(initialDate);
  const [checkin, setCheckin] = useState<Checkin>(initialCheckin);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [digest, setDigest] = useState<Digest>(initialDigest);
  const [streak, setStreak] = useState<number | null>(null);
  const [live, setLive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState(() => `${greetingWord()}, קאי`);

  /* Keeps optimistic writes from being clobbered by a realtime echo that
     raced ahead of the local state. */
  const pendingCheckin = useRef(0);

  // ─── Loaders ──────────────────────────────────────────────────────────────

  const loadCheckin = useCallback(
    async (key: string) => {
      const { data } = await supabase
        .from("checkins")
        .select("date, pills, water, teeth_am, teeth_pm, clean")
        .eq("user_id", userId)
        .eq("date", key)
        .maybeSingle();
      if (pendingCheckin.current === 0) setCheckin(toCheckin(data as CheckinRow | null, key));
    },
    [supabase, userId],
  );

  const loadTasks = useCallback(async () => {
    const { data } = await supabase
      .from("tasks")
      .select("id, text, done, source, category, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(200);
    if (data) setTasks((data as TaskRow[]).map(toTask));
  }, [supabase, userId]);

  const loadDigest = useCallback(async () => {
    const { data } = await supabase
      .from("digest")
      .select("refreshed_at, calendar_today, timeline, inbox, noise")
      .eq("user_id", userId)
      .maybeSingle();
    setDigest(toDigest(data as DigestRow | null));
  }, [supabase, userId]);

  /** Consecutive clean days ending today (or yesterday, if today isn't marked
   *  yet — an unmarked morning shouldn't look like a broken streak). */
  const loadStreak = useCallback(
    async (key: string) => {
      const { data, error } = await supabase
        .from("checkins")
        .select("date, clean")
        .eq("user_id", userId)
        .lte("date", key)
        .order("date", { ascending: false })
        .limit(STREAK_WINDOW);

      if (error || !data) return setStreak(null);

      const byDate = new Map(data.map((r) => [r.date as string, !!r.clean]));
      const startsToday = byDate.get(key) === true;
      let count = 0;
      for (let i = startsToday ? 0 : 1; i < STREAK_WINDOW; i += 1) {
        if (byDate.get(dayBefore(key, i)) === true) count += 1;
        else break;
      }
      setStreak(count);
    },
    [supabase, userId],
  );

  // ─── Initial load + local-midnight rollover ───────────────────────────────

  useEffect(() => {
    void (async () => {
      await Promise.all([loadCheckin(dateKey), loadStreak(dateKey)]);
    })();
  }, [dateKey, loadStreak, loadCheckin]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      timer = setTimeout(() => {
        const key = todayKey();
        setDateKey(key);
        setCheckin(EMPTY_CHECKIN(key));
        setGreeting(`${greetingWord()}, קאי`);
        schedule();
      }, msUntilLocalMidnight());
    };
    schedule();

    // Phones suspend timers; re-check the date whenever the app comes back.
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const key = todayKey();
      setGreeting(`${greetingWord()}, קאי`);
      if (key !== dateKey) setDateKey(key);
      else loadCheckin(key);
      loadTasks();
      loadDigest();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [dateKey, loadCheckin, loadTasks, loadDigest]);

  // ─── Realtime (the replacement for the Artifact's onSnapshot) ─────────────

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    channel = supabase
      .channel(`briefer:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `user_id=eq.${userId}` },
        () => loadTasks(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "checkins", filter: `user_id=eq.${userId}` },
        () => {
          loadCheckin(dateKey);
          loadStreak(dateKey);
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "digest", filter: `user_id=eq.${userId}` },
        () => loadDigest(),
      )
      .subscribe((status) => setLive(status === "SUBSCRIBED"));

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase, userId, dateKey, loadTasks, loadCheckin, loadStreak, loadDigest]);

  // ─── Mutations (optimistic, then persisted) ───────────────────────────────

  const updateCheckin = useCallback(
    async (patch: Partial<Checkin>) => {
      const next = { ...checkin, ...patch, date: dateKey };
      setCheckin(next);
      pendingCheckin.current += 1;

      const { error } = await supabase.from("checkins").upsert(
        {
          user_id: userId,
          date: dateKey,
          pills: next.pills,
          water: next.water,
          teeth_am: next.teethAm,
          teeth_pm: next.teethPm,
          clean: next.clean,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,date" },
      );

      pendingCheckin.current -= 1;
      if (error) await loadCheckin(dateKey);
      else if (patch.clean !== undefined) await loadStreak(dateKey);
    },
    [checkin, dateKey, supabase, userId, loadCheckin, loadStreak],
  );

  const addTask = useCallback(
    async (text: string, category: TaskCategory) => {
      const optimistic: Task = {
        id: `pending-${crypto.randomUUID()}`,
        text,
        done: false,
        source: "manual",
        category,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [...prev, optimistic]);

      const { error } = await supabase
        .from("tasks")
        .insert({ user_id: userId, text, done: false, source: "manual", category });

      if (error) setTasks((prev) => prev.filter((t) => t.id !== optimistic.id));
      await loadTasks();
    },
    [supabase, userId, loadTasks],
  );

  const toggleTask = useCallback(
    async (task: Task) => {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)));
      const { error } = await supabase
        .from("tasks")
        .update({ done: !task.done })
        .eq("id", task.id)
        .eq("user_id", userId);
      if (error) await loadTasks();
    },
    [supabase, userId, loadTasks],
  );

  const deleteTask = useCallback(
    async (task: Task) => {
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      const { error } = await supabase.from("tasks").delete().eq("id", task.id).eq("user_id", userId);
      if (error) await loadTasks();
    },
    [supabase, userId, loadTasks],
  );

  const refreshDigest = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetch("/api/digest/refresh", { method: "POST" });
      await Promise.all([loadDigest(), loadTasks()]);
    } finally {
      setRefreshing(false);
    }
  }, [loadDigest, loadTasks]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="wrap">
      <ServiceWorkerRegister />

      <Masthead
        greeting={greeting}
        live={live}
        refreshedAt={digest.refreshedAt}
        refreshing={refreshing}
        onRefresh={refreshDigest}
      />

      {!googleConnected && (
        <div className="notice">
          <span>
            הדואר והיומן עוד לא מחוברים. חיבור אחד עם Google מפעיל את שני הפאנלים —
            הרשאות קריאה בלבד.
          </span>
          <button className="ghost-btn" onClick={() => signInWithGoogle("/")}>
            לחבר את Google
          </button>
        </div>
      )}

      <CheckinStrip checkin={checkin} streak={streak} onChange={updateCheckin} />

      <div className="grid">
        <div className="col">
          <CalendarPanel events={digest.calendarToday} connected={googleConnected} />
          <MissionsPanel
            tasks={tasks}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onAdd={addTask}
          />
          <TimelinePanel items={digest.timeline} />
        </div>
        <div className="col">
          <InboxPanel items={digest.inbox} noise={digest.noise} connected={googleConnected} />
        </div>
      </div>

      <div className="footnote">
        <b>מה חי כאן:</b> כדורים, מים, שיניים ויום נקי — שלך לסמן, נשמר מיד ומתאפס עם כל יום
        חדש. המשימות הן רשימה אמיתית: חלק מוצעות אוטומטית מהדואר ומהפרויקטים, השאר מה שאתה
        מוסיף. ציר הפרויקטים ואותות מהדואר מתעדכנים אוטומטית כל שעתיים מ-Gmail, מהיומן
        ומקובץ הפרויקטים שלך.
        <br />
        <br />
        הפרויקטים נערכים בקובץ <code>data/projects.json</code>. משימה שכבר הוספת או סימנת
        לעולם לא נדרסת על ידי הריענון האוטומטי.
      </div>

      <div className="sync-note">
        {live ? "" : "אין כרגע חיבור חי — השינויים נשמרים, אבל לא יופיעו מיד במכשירים אחרים."}
      </div>
    </div>
  );
}
