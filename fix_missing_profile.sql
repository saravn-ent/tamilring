
-- Trigger to automatically create a profile for new users
-- This ensures 'profiles' row exists when a user signs up.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, points, level, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    0,
    1,
    'user'
  );
  return new;
end;
$$;

-- Drop existing trigger if it exists to avoid duplication errors (optional, but safe)
drop trigger if exists on_auth_user_created on auth.users;

-- Re-create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Manually insert missing profile for the specific user in error log
-- 12800268-687e-4f80-b26a-5aab8e8e2246
INSERT INTO public.profiles (id, email, points, level, role)
SELECT id, email, 0, 1, 'user'
FROM auth.users
WHERE id = '12800268-687e-4f80-b26a-5aab8e8e2246'::uuid
ON CONFLICT (id) DO NOTHING;
