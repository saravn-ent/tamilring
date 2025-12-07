-- Add social media columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS website_url text,
ADD COLUMN IF NOT EXISTS instagram_handle text,
ADD COLUMN IF NOT EXISTS twitter_handle text,
ADD COLUMN IF NOT EXISTS bio text;

-- Allow users to update their own profile (Policy already exists, but verifying)
-- "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
