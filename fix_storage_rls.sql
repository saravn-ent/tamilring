-- 1. Create the storage bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('ringtone-files', 'ringtone-files', true)
on conflict (id) do nothing;

-- 2. Enable RLS on storage.objects (it usually is by default, but good to be sure)
alter table storage.objects enable row level security;

-- 3. Allow Public Read Access to the bucket
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'ringtone-files' );

-- 4. Allow Authenticated Users to Upload
drop policy if exists "Authenticated Upload" on storage.objects;
create policy "Authenticated Upload"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'ringtone-files' );

-- 5. Allow Users to Update/Delete their own files (Optional but good practice)
drop policy if exists "Users can update own files" on storage.objects;
create policy "Users can update own files"
on storage.objects for update
to authenticated
using ( bucket_id = 'ringtone-files' and auth.uid() = owner );

drop policy if exists "Users can delete own files" on storage.objects;
create policy "Users can delete own files"
on storage.objects for delete
to authenticated
using ( bucket_id = 'ringtone-files' and auth.uid() = owner );
