'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { ensureAuthenticated, getSupabaseAdmin } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { profiles, withdrawals } from '@/lib/db/schema'
import { eq, and, gte } from 'drizzle-orm'
import { syncUserGamification } from '@/lib/gamification'

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
    const { user } = await ensureAuthenticated();

    if (user.id !== userId) {
        return { success: false, error: 'Unauthorized: User ID mismatch' };
    }

    const adminSupabase = await getSupabaseAdmin();

    // 1. Force Sync first - Ensure profiles.points is actually correct based on current reality
    // (This calculates lifetime - [pending + completed withdrawals])
    const syncResult = await syncUserGamification(adminSupabase, userId);

    if (!syncResult) {
        console.error(`[Withdrawal] Sync failed for user ${userId}`);
        return { success: false, error: 'Failed to synchronize account balance. Please try again.' };
    }

    // 2. Validate withdrawal logic WITHIN ATOMIC TRANSACTION
    const minThreshold = 100;
    if (amount < minThreshold) {
        return { success: false, error: `Minimum withdrawal is ${minThreshold} Rep` };
    }

    const withdrawAmount = amount;

    try {
        console.log(`[Withdrawal] Requesting payout for ${userId}: ${withdrawAmount} Rep`);

        // Use the secure RPC function to handle the atomic transaction
        const { data, error: rpcError } = await adminSupabase.rpc('handle_withdrawal_payout', {
            p_user_id: userId,
            p_amount: withdrawAmount,
            p_upi_id: upiId
        });

        if (rpcError) throw new Error(rpcError.message);

        const result = data as { success: boolean, error?: string };
        if (!result.success) {
            throw new Error(result.error || 'Database transaction failed');
        }

        console.log(`[Withdrawal] Success for ${userId}`);

        // 5. Revalidate
        try {
            revalidatePath('/profile');
            revalidatePath('/admin/withdrawals');
            // @ts-expect-error - revalidateTag has type issues in Next.js 16
            revalidateTag('contributors');
        } catch (e) {
            console.warn('Revalidation failed:', e);
        }

        // 6. Log withdrawal (Notify admin via Discord)
        await notifyAdminOnWithdrawal(userId, withdrawAmount, upiId);

        return { success: true };

    } catch (err: any) {
        console.error('[Withdrawal] Failed:', err.message);
        return { success: false, error: err.message || 'Withdrawal failed. Please try again.' };
    }
}
export async function syncProfileStats(userId: string) {
    try {
        const { user } = await ensureAuthenticated();
        if (user.id !== userId) throw new Error('Unauthorized');

        const adminSupabase = await getSupabaseAdmin();
        const { syncUserGamification } = await import('@/lib/gamification');
        const stats = await syncUserGamification(adminSupabase, userId);

        revalidatePath('/profile');
        return { success: true, stats };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
