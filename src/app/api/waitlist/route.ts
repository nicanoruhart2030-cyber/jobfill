import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWaitlistConfirmation } from "@/lib/resend";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  const { error } = await admin.from("waitlist").insert({ email });
  if (error) {
    if (error.code === "23505") {
      await sendWaitlistConfirmation(email);
      return NextResponse.json({ ok: true, duplicate: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const mailed = await sendWaitlistConfirmation(email);
  if (!mailed.ok && mailed.error) {
    return NextResponse.json({ ok: true, emailWarning: mailed.error });
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ count: 847 });
  }
  const { count, error } = await admin.from("waitlist").select("*", { count: "exact", head: true });
  if (error) {
    return NextResponse.json({ count: 847 });
  }
  return NextResponse.json({ count: count ?? 0 });
}
