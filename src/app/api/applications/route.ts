import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationRow } from "@/lib/types";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase.from("applications").select(`
      *,
      jobs (
        title,
        company,
        location,
        job_type,
        salary_min,
        salary_max,
        tags
      )
    `).eq("user_id", user.id).order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows: ApplicationRow[] = (data ?? []).map((r: Record<string, unknown>) => {
    const raw = r.jobs as Record<string, unknown> | Record<string, unknown>[] | null;
    const job = Array.isArray(raw) ? raw[0] ?? null : raw;
    return {
      id: r.id as string,
      user_id: r.user_id as string,
      job_id: r.job_id as string,
      status: r.status as ApplicationRow["status"],
      cover_letter: (r.cover_letter ?? r.cover_letter_used ?? null) as string | null,
      fields_filled: r.fields_filled as number,
      screenshot_url: r.screenshot_url as string | null,
      error_message: (r.error_message ?? null) as string | null,
      applied_at: r.applied_at as string | null,
      created_at: r.created_at as string,
      jobs: job
        ? {
            title: String(job.title ?? ""),
            company: String(job.company ?? ""),
            location: String(job.location ?? ""),
            job_type: String(job.job_type ?? ""),
            salary_min: (job.salary_min as number | null) ?? null,
            salary_max: (job.salary_max as number | null) ?? null,
            tags: (job.tags as string[] | null) ?? null,
          }
        : null,
    };
  });

  return NextResponse.json({ applications: rows });
}
