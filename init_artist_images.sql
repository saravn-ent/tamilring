-- Create the artist_images table if it doesn't exist
create table if not exists public.artist_images (
    id uuid not null default gen_random_uuid(),
    artist_name text not null,
    image_url text not null,
    created_at timestamp with time zone not null default now(),
    constraint artist_images_pkey primary key (id),
    constraint artist_images_artist_name_key unique (artist_name)
);

-- Establish Row Level Security
alter table public.artist_images enable row level security;

-- Policy: Everyone can view artist images
drop policy if exists "Public can view artist images" on public.artist_images;
create policy "Public can view artist images"
    on public.artist_images
    for select
    using (true);

-- Policy: Only Admins can insert/update/delete (Using the same logic as ringtones/profiles where we check role)
-- Note: You might need to check how your admin role is defined. 
-- Assuming 'profiles' table has a 'role' column or similar check using auth.uid()

drop policy if exists "Admins can insert artist images" on public.artist_images;
create policy "Admins can insert artist images"
    on public.artist_images
    for insert
    with check (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
    );

drop policy if exists "Admins can update artist images" on public.artist_images;
create policy "Admins can update artist images"
    on public.artist_images
    for update
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
    );

drop policy if exists "Admins can delete artist images" on public.artist_images;
create policy "Admins can delete artist images"
    on public.artist_images
    for delete
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
    );

-- Creating a STORAGE BUCKET for artists if it doesn't exist
-- This is often done in the UI, but ensuring policies here is good practice if using an existing bucket like 'images' or 'public'
-- For now, we assume standard 'public' or separate 'artists' bucket. 
-- Let's assume we use a bucket named 'artists'.

insert into storage.buckets (id, name, public)
values ('artists', 'artists', true)
on conflict (id) do nothing;

create policy "Public Access to Artists Bucket"
  on storage.objects for select
  using ( bucket_id = 'artists' );

create policy "Admins can upload to Artists Bucket"
  on storage.objects for insert
  with check (
    bucket_id = 'artists' AND
    exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );
  
create policy "Admins can update/delete in Artists Bucket"
  on storage.objects for all
  using (
    bucket_id = 'artists' AND
    exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );
