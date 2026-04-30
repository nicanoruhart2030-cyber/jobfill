create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text,
  phone text,
  city text,
  province text,
  country text,
  linkedin_url text,
  portfolio_url text,
  github_url text,
  school text,
  degree text,
  major text,
  grad_year int,
  work_auth text,
  salary_expectation text,
  resume_url text,
  groq_api_key text,
  skills text[] not null default '{}'::text[],
  created_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  location text not null,
  salary_range text,
  job_type text not null,
  ats_url text not null,
  description text not null,
  tags text[] not null default '{}'::text[],
  source text not null default 'seed',
  created_at timestamptz not null default now()
);

create unique index if not exists idx_jobs_ats_url_unique
  on public.jobs(ats_url);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  status text not null default 'queued' check (
    status in (
      'queued',
      'applying',
      'applied',
      'failed',
      'interview',
      'rejected',
      'offer',
      'needs_manual_review'
    )
  ),
  fields_filled int not null default 0,
  cover_letter_used text,
  screenshot_url text,
  applied_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, job_id)
);

create index if not exists idx_applications_queue_status_created
  on public.applications(status, created_at);

create index if not exists idx_applications_user_applied_at
  on public.applications(user_id, applied_at);

create index if not exists idx_jobs_created_at
  on public.jobs(created_at desc);

alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;

create policy if not exists "users_select_own_profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy if not exists "users_insert_own_profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy if not exists "users_update_own_profile"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists "authenticated_select_jobs"
  on public.jobs for select
  using (auth.role() = 'authenticated');

create policy if not exists "authenticated_insert_jobs"
  on public.jobs for insert
  with check (auth.role() = 'authenticated');

create policy if not exists "users_select_own_applications"
  on public.applications for select
  using (auth.uid() = user_id);

create policy if not exists "users_insert_own_applications"
  on public.applications for insert
  with check (auth.uid() = user_id);

create policy if not exists "users_update_own_applications"
  on public.applications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('application-proofs', 'application-proofs', false)
on conflict (id) do nothing;

create policy if not exists "users_upload_own_resumes"
  on storage.objects for insert
  with check (
    bucket_id = 'resumes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "users_read_own_resumes"
  on storage.objects for select
  using (
    bucket_id = 'resumes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "service_upload_application_proofs"
  on storage.objects for insert
  with check (
    bucket_id = 'application-proofs'
  );

create policy if not exists "users_read_own_application_proofs"
  on storage.objects for select
  using (
    bucket_id = 'application-proofs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
