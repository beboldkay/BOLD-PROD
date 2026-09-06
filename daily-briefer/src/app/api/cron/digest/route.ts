import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { runDigestForUser } from "@/lib/digest";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Scheduled digest rebuild. Vercel Cron calls this every two hours (see
 * vercel.json) with `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Everyone who has connected Google — in practice, one person.
  const { data: tokens, error } = await admin.from("google_tokens").select("user_id");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const results = [];
  for (const { user_id } of tokens ?? []) {
    const { data: userData } = await admin.auth.admin.getUserById(user_id);
    const email = userData?.user?.email;
    if (!email) continue;
    results.push(await runDigestForUser(admin, { id: user_id, email }));
  }

  return NextResponse.json({ ranAt: new Date().toISOString(), results });
}
