-- Align schema to JobFill v1 spec:
--   profiles.postal_code, profiles.plan
--   applications.error_message (alias of notes for compatibility)
--   country defaults to 'Canada'

alter table public.profiles
  add column if not exists postal_code text,
  add column if not exists plan text not null default 'free';

alter table public.profiles
  alter column country set default 'Canada';

alter table public.applications
  add column if not exists error_message text;

-- Backfill error_message from notes for any rows where notes was used as error
update public.applications
set error_message = notes
where error_message is null and status in ('failed', 'needs_manual_review');

-- Auto-create profile row when a new auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email)
  values (new.id, new.email)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
