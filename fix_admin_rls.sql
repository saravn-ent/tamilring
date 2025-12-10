-- Allow Admins to read and update all profiles
create policy "Admins can view all profiles"
  on profiles for select
  using (
    auth.uid() in (
      select id from profiles where role = 'admin'
    )
  );

create policy "Admins can update all profiles"
  on profiles for update
  using (
    auth.uid() in (
      select id from profiles where role = 'admin'
    )
  );

-- Allow Admins to manage user_badges
create policy "Admins can manage user_badges"
  on user_badges for all
  using (
    auth.uid() in (
      select id from profiles where role = 'admin'
    )
  );
