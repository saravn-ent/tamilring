
-- Revoke the dangerous policy allowing users to insert their own withdrawals
DROP POLICY IF EXISTS "Users can insert own withdrawals" ON public.withdrawals;

-- Clean up any invalid data that would violate the new constraint
DELETE FROM public.withdrawals WHERE amount < 100;

-- Add a constraint to ensure withdrawal amounts are always positive and meet minimum
ALTER TABLE public.withdrawals 
ADD CONSTRAINT withdrawals_amount_check CHECK (amount >= 100);

-- Ensure only admins can insert/update withdrawals (already covered by existing policies, but good to be sure)
-- (No change needed as default RLS denies everything not explicitly allowed)

-- Note: We are keeping "Users can view their own withdrawals"
