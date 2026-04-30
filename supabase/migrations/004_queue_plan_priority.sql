-- Pro subscribers' queued applications are claimed before free users.

create or replace function public.claim_next_application()
returns table (
  id uuid,
  user_id uuid,
  job_id uuid,
  status text,
  fields_filled int,
  cover_letter_used text,
  screenshot_url text,
  applied_at timestamptz,
  notes text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed_id uuid;
begin
  select a.id
  into claimed_id
  from public.applications a
  inner join public.profiles p on p.user_id = a.user_id
  where a.status = 'queued'
  order by case when p.plan = 'pro' then 0 else 1 end, a.created_at asc
  for update of a skip locked
  limit 1;

  if claimed_id is null then
    return;
  end if;

  update public.applications
  set status = 'applying'
  where applications.id = claimed_id;

  return query
  select
    a.id,
    a.user_id,
    a.job_id,
    a.status,
    a.fields_filled,
    a.cover_letter_used,
    a.screenshot_url,
    a.applied_at,
    a.notes,
    a.created_at
  from public.applications a
  where a.id = claimed_id;
end;
$$;

revoke all on function public.claim_next_application() from public;
grant execute on function public.claim_next_application() to service_role;
