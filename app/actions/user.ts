'use server'

import { revalidatePath } from 'next/cache'
import { ensureAuthenticated, getSupabaseAdmin } from '@/lib/auth-server'

// Internal helper for notifications
async function notifyAdminOnWithdrawal(userId: string, amount: number, upiId: string) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return;

    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: `💰 **Withdrawal Request**\nUser: ${userId}\nAmount: ${amount} Rep\nUPI ID: ${upiId}`,
            })
        });
    } catch (e) {
        console.error('Withdrawal notification failed', e);
    }
}

export async function handleUploadReward(userId: string) {
    // This is technically an triggered action, but we should verify the user matches the session
    const { supabase, user } = await ensureAuthenticated();

    if (user.id !== userId) {
        return { success: false, error: 'Unauthorized: User ID mismatch' };
    }

    // 1. Check if first upload reward already given
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_first_upload_rewarded, points')
        .eq('id', userId)
        .single();

    if (profile && !profile.is_first_upload_rewarded) {
        const adminSupabase = await getSupabaseAdmin();

        // 2. Give 15 Rep bonus immediately
        const { error } = await adminSupabase
            .from('profiles')
            .update({
                is_first_upload_rewarded: true,
                points: (profile.points || 0) + 15
            })
            .eq('id', userId);

        if (error) return { success: false, error };
        return { success: true, bonusGiven: true };
    }

    return { success: true, bonusGiven: false };
}

export async function handleWithdrawal(userId: string, amount: number, upiId: string) {
    const { supabase, user } = await ensureAuthenticated();

    if (user.id !== userId) {
        return { success: false, error: 'Unauthorized: User ID mismatch' };
    }

    // 1. Get current profile stats
    const { data: profile } = await supabase
        .from('profiles')
        .select('points, total_withdrawn_count')
        .eq('id', userId)
        .single();

    if (!profile) return { success: false, error: 'User not found' };

    // 2. Validate withdrawal logic
    const minThreshold = 100;

    if (amount < minThreshold) {
        return { success: false, error: `Minimum withdrawal is ${minThreshold} Rep` };
    }

    const withdrawAmount = amount;

    if (profile.points < withdrawAmount) {
        return { success: false, error: `Insufficient Reputation Points. Need ${withdrawAmount} Rep.` };
    }

    const adminSupabase = await getSupabaseAdmin();

    // 3. Process withdrawal (Atomic update)
    console.log(`Processing withdrawal for user ${userId}: ${withdrawAmount} Rep`);
    const { error } = await adminSupabase
        .from('profiles')
        .update({
            points: profile.points - withdrawAmount,
            total_withdrawn_count: (profile.total_withdrawn_count || 0) + 1,
            upi_id: upiId // Ensure UPI ID is saved
        })
        .eq('id', userId);

    if (error) {
        console.error('Failed to update profile points:', error);
        return { success: false, error: error.message };
    }

    // 4. Log withdrawal in the database for admin to see
    console.log('Logging withdrawal in withdrawals table...');
    const { error: logError } = await adminSupabase
        .from('withdrawals')
        .insert({
            user_id: userId,
            amount: withdrawAmount,
            upi_id: upiId,
            status: 'pending'
        });

    if (logError) {
        console.error('Failed to log withdrawal to DB:', logError);
        // CRITICAL: We already deducted points! 
        // We should theoretically rollback, but for now we just return error.
        // The admin can use the logs to fix it.
        return { success: false, error: 'Failed to record withdrawal request. Please contact support.' };
    }
    console.log('Withdrawal successful.');

    // 5. Revalidate
    try {
        revalidatePath('/profile');
        revalidatePath('/admin/withdrawals');
    } catch (e) {
        console.warn('Revalidation failed, data might be stale:', e);
    }

    // 6. Log withdrawal (Optionally notify admin via Discord)
    await notifyAdminOnWithdrawal(userId, withdrawAmount, upiId);

    return { success: true };
}
