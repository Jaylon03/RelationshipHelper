-- Validly: idea validation tables
-- The existing 'reports' table is preserved for backwards compatibility with StackedPath.
-- After confirming StackedPath data is no longer needed, run: DROP TABLE reports;

create table if not exists scans (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  user_id uuid references auth.users(id),
  idea text not null,
  subreddits text[],
  status text default 'completed'
);

create table if not exists pain_points (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  scan_id uuid references scans(id),
  user_id uuid references auth.users(id),
  rank integer,
  title text,
  score integer,
  subreddit text,
  evidence text[],
  signal text,
  is_saved boolean default false
);

create table if not exists scan_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  date date default current_date,
  count integer default 0,
  unique(user_id, date)
);

-- RLS for scans
alter table scans enable row level security;
create policy "Users can view own scans" on scans
  for select using (auth.uid() = user_id);
create policy "Users can insert own scans" on scans
  for insert with check (auth.uid() = user_id);

-- RLS for pain_points
alter table pain_points enable row level security;
create policy "Users can view own pain_points" on pain_points
  for select using (auth.uid() = user_id);
create policy "Users can insert own pain_points" on pain_points
  for insert with check (auth.uid() = user_id);
create policy "Users can update own pain_points" on pain_points
  for update using (auth.uid() = user_id);

-- RLS for scan_usage
alter table scan_usage enable row level security;
create policy "Users can view own scan_usage" on scan_usage
  for select using (auth.uid() = user_id);
create policy "Users can insert own scan_usage" on scan_usage
  for insert with check (auth.uid() = user_id);
create policy "Users can update own scan_usage" on scan_usage
  for update using (auth.uid() = user_id);
