import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runDigestForUser } from "@/lib/digest";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** The "רענן עכשיו" button: same job as the cron, for the signed-in user only. */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const result = await runDigestForUser(createAdminClient(), { id: user.id, email: user.email });
  return NextResponse.json(result, { status: result.ok ? 200 : 207 });
}
