import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { canQueueApplication } from "@/lib/billing";
import { ensureProfileForClerkUser, getProfileUserIdByClerk } from "@/lib/profile/ensure";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { BillingTier } from "@/lib/types";

export const runtime = "nodejs";

const queueRequestSchema = z.object({
  job: z.object({
    title: z.string(),
    company: z.string(),
    location: z.string(),
    salary_range: z.string(),
    job_type: z.string(),
    ats_url: z.string().url(),
    description: z.string(),
    tags: z.array(z.string()),
  }),
});

function startOfMonthIso() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export async function POST(request: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let internalUserId = await getProfileUserIdByClerk(clerkId);
  if (!internalUserId) {
    internalUserId = await ensureProfileForClerkUser();
  }
  if (!internalUserId) {
    return NextResponse.json({ error: "Profile not ready" }, { status: 500 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = queueRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("plan")
    .eq("user_id", internalUserId)
    .maybeSingle();

  const tier: BillingTier = profile?.plan === "pro" ? "pro" : "free";

  const { count: monthlyCount, error: countError } = await supabaseAdmin
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", internalUserId)
    .gte("created_at", startOfMonthIso());

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  const queueCheck = canQueueApplication(tier, monthlyCount ?? 0);
  if (!queueCheck.allowed) {
    return NextResponse.json({ error: queueCheck.reason }, { status: 402 });
  }

  const { job } = parsed.data;

  const { data: existingJob } = await supabaseAdmin
    .from("jobs")
    .select("id")
    .eq("ats_url", job.ats_url)
    .maybeSingle();

  let jobId = existingJob?.id;
  if (!jobId) {
    const { data: insertedJob, error: jobInsertError } = await supabaseAdmin
      .from("jobs")
      .insert({
        title: job.title,
        company: job.company,
        location: job.location,
        salary_range: job.salary_range,
        job_type: job.job_type,
        ats_url: job.ats_url,
        description: job.description,
        tags: job.tags,
        source: "seed",
      })
      .select("id")
      .single();
    if (jobInsertError) {
      return NextResponse.json({ error: jobInsertError.message }, { status: 500 });
    }
    jobId = insertedJob.id;
  }

  const { error: queueError } = await supabaseAdmin.from("applications").upsert(
    {
      user_id: internalUserId,
      job_id: jobId,
      status: "queued",
    },
    { onConflict: "user_id,job_id" },
  );

  if (queueError) {
    return NextResponse.json({ error: queueError.message }, { status: 500 });
  }

  return NextResponse.json({ queued: true });
}
