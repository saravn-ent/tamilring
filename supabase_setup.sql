-- 1. Create the ringtones table
create table public.ringtones (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  title text not null,
  slug text not null,
  movie_name text not null,
  movie_year text null,
  singers text null,
  poster_url text null,
  backdrop_url text null,
  audio_url text not null,
  waveform_url text null,
  mood text null,
  downloads integer not null default 0,
  constraint ringtones_pkey primary key (id),
  constraint ringtones_slug_key unique (slug)
);

-- 2. Enable Row Level Security (RLS)
alter table public.ringtones enable row level security;

-- 3. Create a policy to allow anyone to view ringtones
create policy "Enable read access for all users" on public.ringtones
  for select using (true);

-- 4. Create a policy to allow anyone to upload ringtones
create policy "Enable insert access for all users" on public.ringtones
  for insert with check (true);
