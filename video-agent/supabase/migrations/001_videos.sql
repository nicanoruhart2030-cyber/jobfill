create table if not exists videos (
  id uuid default gen_random_uuid() primary key,
  angle text not null,
  script text,
  video_url text,
  local_path text,
  tiktok_url text,
  instagram_url text,
  youtube_url text,
  tiktok_views int default 0,
  instagram_views int default 0,
  youtube_views int default 0,
  status text default 'generating',
  error text,
  created_at timestamptz default now()
);

create index if not exists videos_created_at_idx on videos (created_at desc);
