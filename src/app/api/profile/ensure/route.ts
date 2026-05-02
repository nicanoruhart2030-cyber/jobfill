import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureProfileForClerkUser } from "@/lib/profile/ensure";

export const runtime = "nodejs";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user_id = await ensureProfileForClerkUser();
  if (!user_id) {
    return NextResponse.json({ error: "Profile could not be created" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, user_id });
}
