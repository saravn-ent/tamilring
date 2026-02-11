-- Secure withdrawal transaction function via RPC
-- This allows atomic transactions without needing a direct DATABASE_URL connection in the application.

CREATE OR REPLACE FUNCTION handle_withdrawal_payout(
    p_user_id uuid,
    p_amount int,
    p_upi_id text
)
RETURNS json AS $$
DECLARE
    v_current_points int;
BEGIN
    -- 1. Lock the profile row to prevent race conditions during the transaction
    SELECT points INTO v_current_points 
    FROM profiles 
    WHERE id = p_user_id 
    FOR UPDATE;

    IF v_current_points IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User profile not found');
    END IF;

    -- 2. Validate balance
    IF v_current_points < p_amount THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient balance. Available: ' || v_current_points || ' Rep.');
    END IF;

    -- 3. Deduct points and update UPI ID
    UPDATE profiles 
    SET 
        points = points - p_amount,
        upi_id = p_upi_id,
        total_withdrawn_count = COALESCE(total_withdrawn_count, 0) + 1
    WHERE id = p_user_id;

    -- 4. Create withdrawal record
    INSERT INTO withdrawals (user_id, amount, upi_id, status)
    VALUES (p_user_id, p_amount, p_upi_id, 'pending');

    RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
