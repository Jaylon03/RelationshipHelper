-- StackedPath: reports table
create table public.reports (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamp with time zone default now(),
  form_input       jsonb not null,
  report_data      jsonb not null,
  is_paid          boolean default false,
  stripe_session_id text,
  email            text
);

-- Reports are publicly readable by ID (shareable links work without auth).
-- All writes are performed via service role key (bypasses RLS) from API routes.
alter table public.reports enable row level security;

create policy "reports: public read by id" on public.reports
  for select using (true);
