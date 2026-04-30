-- Waitlist + schema extensions for composer product

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

drop policy if exists "waitlist_anon_insert" on public.waitlist;
create policy "waitlist_anon_insert"
  on public.waitlist for insert
  to anon, authenticated
  with check (true);

alter table public.profiles add column if not exists postal_code text;

alter table public.jobs add column if not exists salary_min int;
alter table public.jobs add column if not exists salary_max int;
alter table public.jobs add column if not exists apply_url text;
alter table public.jobs add column if not exists external_id text;

update public.jobs set apply_url = coalesce(apply_url, ats_url) where apply_url is null;

alter table public.applications add column if not exists error_message text;
alter table public.applications add column if not exists cover_letter text;

alter table public.applications drop constraint if exists applications_status_check;

alter table public.applications add constraint applications_status_check check (
  status in (
    'queued',
    'applying',
    'applied',
    'failed',
    'interview',
    'rejected',
    'offer',
    'needs_manual_review',
    'accepted',
    'needs_review'
  )
);

create index if not exists idx_waitlist_created on public.waitlist(created_at desc);
