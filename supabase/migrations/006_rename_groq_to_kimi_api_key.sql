-- Legacy installs used groq_api_key; new column name is kimi_api_key
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'groq_api_key'
  ) then
    alter table public.profiles rename column groq_api_key to kimi_api_key;
  end if;
end $$;
