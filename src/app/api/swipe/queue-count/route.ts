import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureProfileForClerkUser, getProfileUserIdByClerk } from "@/lib/profile/ensure";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ count: 0 });
  }

  let internalUserId = await getProfileUserIdByClerk(clerkId);
  if (!internalUserId) {
    internalUserId = await ensureProfileForClerkUser();
  }
  if (!internalUserId) {
    return NextResponse.json({ count: 0 });
  }

  const admin = getSupabaseAdmin();
  const { count, error } = await admin
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", internalUserId)
    .eq("status", "queued");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ count: count ?? 0 });
}
