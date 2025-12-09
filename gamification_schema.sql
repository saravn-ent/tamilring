-- Add Gamification columns to profiles
alter table public.profiles 
add column if not exists points integer default 0,
add column if not exists level integer default 1;

-- Create Badges Table
create table if not exists public.badges (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    description text not null,
    icon_name text not null, -- Stores the icon identifier (e.g., 'star', 'music', 'trophy')
    condition_type text check (condition_type in ('uploads_count', 'likes_received_count', 'manual')) not null,
    condition_value integer default 0,
    created_at timestamptz default now()
);

-- Create User Badges (Link Table)
create table if not exists public.user_badges (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    badge_id uuid references public.badges(id) on delete cascade not null,
    awarded_at timestamptz default now(),
    unique(user_id, badge_id)
);

-- Seed Initial Badges
insert into public.badges (name, description, icon_name, condition_type, condition_value)
values 
    ('First Cut', 'Uploaded your first ringtone', 'scissors', 'uploads_count', 1),
    ('Rising Star', 'Uploaded 10 approved ringtones', 'zap', 'uploads_count', 10),
    ('Trendsetter', 'Uploaded 50 approved ringtones', 'crown', 'uploads_count', 50),
    ('Community Loved', 'Received 100 total likes', 'heart', 'likes_received_count', 100)
on conflict do nothing;

-- Enable RLS
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;

-- Policies
create policy "Badges are viewable by everyone" 
    on public.badges for select using (true);

create policy "User Badges are viewable by everyone" 
    on public.user_badges for select using (true);

-- Only system/service role should insert badges usually, but for now allow authenticated to read
