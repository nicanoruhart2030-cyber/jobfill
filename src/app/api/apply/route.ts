import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureProfileForClerkUser } from "@/lib/profile/ensure";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rateLimit";
import type { SwipeJob } from "@/lib/types";

export const runtime = "nodejs";

const jobSchema = z.object({
  job: z.object({
    id: z.string(),
    title: z.string(),
    company: z.string(),
    location: z.string(),
    salary_display: z.string(),
    job_type: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    apply_url: z.string().url(),
  }),
});

const APPLY_RATE_MAX = 20;
const APPLY_RATE_WINDOW_MS = 60_000;

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  if (!checkRateLimit(`apply:${clerkId}`, APPLY_RATE_MAX, APPLY_RATE_WINDOW_MS)) {
    return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
  }

  const internalUserId = await ensureProfileForClerkUser();
  if (!internalUserId) {
    return NextResponse.json({ error: "Profile not ready" }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = jobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid job payload" }, { status: 400 });
  }

  const j: SwipeJob = {
    ...parsed.data.job,
    salary_min: null,
    salary_max: null,
    match_score: 0,
  };

  const admin = getSupabaseAdmin();

  const { data: existing, error: existingErr } = await admin
    .from("jobs")
    .select("id")
    .eq("ats_url", j.apply_url)
    .maybeSingle();

  if (existingErr) {
    return NextResponse.json({ error: existingErr.message }, { status: 500 });
  }

  let tid = existing?.id as string | undefined;
  if (!tid) {
    const { data: ins, error: jobErr } = await admin
      .from("jobs")
      .insert({
        title: j.title,
        company: j.company,
        location: j.location,
        salary_range: j.salary_display,
        job_type: j.job_type,
        ats_url: j.apply_url,
        apply_url: j.apply_url,
        description: j.description,
        tags: j.tags,
        source: j.id.startsWith("seed") ? "seed" : "jsearch",
        external_id: j.id.startsWith("seed") ? null : j.id,
      })
      .select("id")
      .single();
    if (jobErr || !ins) {
      return NextResponse.json({ error: jobErr?.message ?? "Job insert failed" }, { status: 500 });
    }
    tid = ins.id as string;
  }

  const { error: appErr } = await admin.from("applications").upsert(
    {
      user_id: internalUserId,
      job_id: tid,
      status: "queued",
    },
    { onConflict: "user_id,job_id" },
  );

  if (appErr) {
    return NextResponse.json({ error: appErr.message }, { status: 500 });
  }

  void maybeTriggerWorker();

  return NextResponse.json({ queued: true, jobId: tid });
}

async function maybeTriggerWorker() {
  if (process.env.APPLY_TRIGGER_ON_POST !== "1") return;
  try {
    const { processNextQueuedApplication } = await import("@/workers/applyWorker");
    void processNextQueuedApplication();
  } catch {
    /* worker not bundle-safe in some runtimes */
  }
}
