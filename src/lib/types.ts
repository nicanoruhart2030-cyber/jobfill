export type ApplicationStatus =
  | "queued"
  | "applying"
  | "applied"
  | "failed"
  | "interview"
  | "rejected"
  | "offer"
  | "needs_manual_review"
  | "accepted"
  | "needs_review";

export type BillingTier = "free" | "pro";

export type Profile = {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  postal_code?: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  github_url: string | null;
  school: string | null;
  degree: string | null;
  major: string | null;
  grad_year: number | null;
  work_auth: string | null;
  salary_expectation: string | null;
  resume_url: string | null;
  groq_api_key: string | null;
  skills: string[];
  plan?: "free" | "pro";
  created_at: string;
};

/** Normalized job for swipe + APIs */
export type SwipeJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_display: string;
  job_type: string;
  description: string;
  tags: string[];
  apply_url: string;
  match_score: number;
};

/** HTML swipe deck compatibility */
export type JobCardData = SwipeJob & { salary_range?: string };

/** DB job row — worker + legacy queue */
export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary_range: string | null;
  job_type: string;
  ats_url: string;
  description: string;
  tags: string[];
  source?: string;
  created_at?: string;
};

export type QueueResult = {
  success: boolean;
  fieldsFilled: number;
  fieldsSkipped: number;
  screenshotBase64: string;
};

export type ApplicationRow = {
  id: string;
  user_id: string;
  job_id: string;
  status: ApplicationStatus;
  cover_letter: string | null;
  fields_filled: number;
  screenshot_url: string | null;
  error_message: string | null;
  applied_at: string | null;
  created_at: string;
  jobs: {
    title: string;
    company: string;
    location: string;
    job_type: string;
    salary_min: number | null;
    salary_max: number | null;
    tags: string[] | null;
  } | null;
};

export type ResultsFilter = "all" | "applied" | "interviewing" | "accepted" | "rejected";
