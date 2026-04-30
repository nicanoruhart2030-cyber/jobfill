import type { SwipeJob } from "@/lib/types";
import { seedSwipeJobs } from "@/lib/seedJobs";

type JSearchPayload = {
  data?: Array<Record<string, unknown>>;
};

function pickStr(v: unknown): string {
  if (typeof v === "string") return v;
  if (v == null) return "";
  return String(v);
}

function mapRow(r: Record<string, unknown>, i: number): SwipeJob {
  const jobId = r.job_id ?? r.jobId ?? `jx-${i}`;
  const min = typeof r.job_min_salary === "number" ? r.job_min_salary : null;
  const max = typeof r.job_max_salary === "number" ? r.job_max_salary : null;
  const display =
    min != null && max != null
      ? `$${Math.round(min / 1000)}k–${Math.round(max / 1000)}k`
      : typeof r.job_salary === "string"
        ? r.job_salary
        : "Competitive";

  return {
    id: String(jobId),
    title: pickStr(r.job_title) || "Software developer",
    company: pickStr(r.employer_name) || "Company",
    location: [pickStr(r.job_city), pickStr(r.job_country)].filter(Boolean).join(", ") || "Canada",
    salary_min: min,
    salary_max: max,
    salary_display: display,
    job_type: pickStr(r.job_employment_type) || "Full-time",
    description: pickStr(r.job_description)?.slice(0, 2000) || "",
    tags: Array.isArray(r.job_required_skills)
      ? (r.job_required_skills as unknown[]).map((x) => String(x)).slice(0, 8)
      : [],
    apply_url: pickStr(r.job_apply_link) || pickStr(r.job_google_link) || "https://example.com/apply",
    match_score: 60 + (i % 35),
  };
}

export async function fetchJobsFromJSearch(): Promise<SwipeJob[] | null> {
  const key = process.env.JSEARCH_API_KEY;
  if (!key) return null;

  const url =
    "https://jsearch.p.rapidapi.com/search?query=software%20developer&location=Canada&page=1&num_pages=1";

  const res = await fetch(url, {
    headers: {
      "X-RapidAPI-Key": key,
      "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) return null;

  const json = (await res.json()) as JSearchPayload;
  if (!json.data?.length) return null;

  return json.data.slice(0, 24).map(mapRow);
}

export async function getSwipeJobs(): Promise<SwipeJob[]> {
  const remote = await fetchJobsFromJSearch();
  if (remote?.length) return remote;
  return seedSwipeJobs();
}
