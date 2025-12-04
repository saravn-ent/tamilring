-- Function to increment likes atomically
create or replace function increment_likes(row_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update ringtones
  set likes = coalesce(likes, 0) + 1
  where id = row_id;
end;
$$;

-- Function to increment downloads atomically
create or replace function increment_downloads(row_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update ringtones
  set downloads = coalesce(downloads, 0) + 1
  where id = row_id;
end;
$$;
