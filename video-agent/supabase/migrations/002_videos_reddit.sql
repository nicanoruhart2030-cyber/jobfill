-- Reddit publish links + view placeholder (update later if you add analytics)
alter table videos add column if not exists reddit_url text;
alter table videos add column if not exists reddit_views int default 0;
