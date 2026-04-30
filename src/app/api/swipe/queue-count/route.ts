import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ count: 0 });
  }

  const { count } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "queued");

  return NextResponse.json({ count: count ?? 0 });
}
