import { redirect } from "next/navigation";

import Dashboard from "@/components/Dashboard";
import { createClient } from "@/lib/supabase/server";
import { todayKey } from "@/lib/dates";
import {
  toCheckin,
  toDigest,
  toTask,
  type CheckinRow,
  type DigestRow,
  type TaskRow,
} from "@/lib/types";

// Personal, per-user, always-live data: nothing here is cacheable.
export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const date = todayKey();

  const [checkinRes, tasksRes, digestRes, googleRes] = await Promise.all([
    supabase
      .from("checkins")
      .select("date, pills, water, teeth_am, teeth_pm, clean")
      .eq("user_id", user.id)
      .eq("date", date)
      .maybeSingle(),
    supabase
      .from("tasks")
      .select("id, text, done, source, category, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(200),
    supabase
      .from("digest")
      .select("refreshed_at, calendar_today, timeline, inbox, noise")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.rpc("google_is_connected"),
  ]);

  return (
    <Dashboard
      userId={user.id}
      initialDate={date}
      initialCheckin={toCheckin(checkinRes.data as CheckinRow | null, date)}
      initialTasks={((tasksRes.data ?? []) as TaskRow[]).map(toTask)}
      initialDigest={toDigest(digestRes.data as DigestRow | null)}
      googleConnected={googleRes.data === true}
    />
  );
}
