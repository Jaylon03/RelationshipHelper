-- ─────────────────────────────────────────────
-- inspo-edit: initial schema
-- ─────────────────────────────────────────────

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ── profiles ──────────────────────────────────
-- Mirrors auth.users; one row per signed-up user
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create a profile whenever a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── projects ──────────────────────────────────
-- A project ties one inspo video to one raw footage upload
create table public.projects (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  title           text not null default 'Untitled Project',
  status          text not null default 'pending'
                    check (status in ('pending','analyzing','processing','ready','failed')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── videos ────────────────────────────────────
-- Stores both inspo videos and raw footage uploads
create table public.videos (
  id              uuid primary key default uuid_generate_v4(),
  project_id      uuid not null references public.projects(id) on delete cascade,
  type            text not null check (type in ('inspo','raw','output')),
  storage_path    text,           -- Supabase Storage bucket path
  source_url      text,           -- if user pasted a URL instead of uploading
  duration_secs   numeric,
  resolution      text,           -- e.g. "1920x1080"
  fps             numeric,
  file_size_bytes bigint,
  created_at      timestamptz not null default now()
);

-- ── style_profiles ────────────────────────────
-- Extracted edit fingerprint from an inspo video
create table public.style_profiles (
  id              uuid primary key default uuid_generate_v4(),
  project_id      uuid not null references public.projects(id) on delete cascade,
  inspo_video_id  uuid not null references public.videos(id) on delete cascade,
  -- timing
  avg_clip_duration_secs  numeric,
  cut_times               jsonb,   -- array of cut timestamps
  -- color
  color_grade_lut         jsonb,   -- LUT coefficients or filter params
  brightness              numeric,
  contrast                numeric,
  saturation              numeric,
  -- transitions
  transitions             jsonb,   -- [{at_sec, type, duration_ms}]
  -- text / captions
  caption_style           jsonb,   -- font, size, position, color
  -- audio
  beat_timestamps         jsonb,   -- detected beat markers
  audio_fade_in_secs      numeric,
  audio_fade_out_secs     numeric,
  -- raw analysis blob for future use
  raw_analysis            jsonb,
  created_at              timestamptz not null default now()
);

-- ── RLS policies ──────────────────────────────
alter table public.profiles      enable row level security;
alter table public.projects      enable row level security;
alter table public.videos        enable row level security;
alter table public.style_profiles enable row level security;

-- profiles: users can only see/edit their own
create policy "profiles: own row" on public.profiles
  for all using (auth.uid() = id);

-- projects: users can only see/edit their own
create policy "projects: own rows" on public.projects
  for all using (auth.uid() = user_id);

-- videos: access through project ownership
create policy "videos: via project" on public.videos
  for all using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

-- style_profiles: access through project ownership
create policy "style_profiles: via project" on public.style_profiles
  for all using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

-- ── Storage buckets ───────────────────────────
insert into storage.buckets (id, name, public)
values
  ('inspo-videos',  'inspo-videos',  false),
  ('raw-footage',   'raw-footage',   false),
  ('output-videos', 'output-videos', false);

-- Storage RLS: users can only access their own files
create policy "inspo: own files" on storage.objects
  for all using (
    bucket_id = 'inspo-videos' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "raw: own files" on storage.objects
  for all using (
    bucket_id = 'raw-footage' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "output: own files" on storage.objects
  for all using (
    bucket_id = 'output-videos' and auth.uid()::text = (storage.foldername(name))[1]
  );
