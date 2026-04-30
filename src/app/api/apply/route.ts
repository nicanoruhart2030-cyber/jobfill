import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { SwipeJob } from "@/lib/types";

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

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
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

  const { data: existing } = await admin.from("jobs").select("id").eq("ats_url", j.apply_url).maybeSingle();

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
      user_id: user.id,
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
    /* worker not bundle-safe in edge — ignore */
  }
}
