
-- Allow users to insert their own withdrawal requests
CREATE POLICY "Users can insert own withdrawals" ON public.withdrawals 
FOR INSERT WITH CHECK (auth.uid() = user_id);
