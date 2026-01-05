'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { ensureAdmin } from '@/lib/auth-server'

export async function approveRingtone(id: string, userId?: string) {
    await ensureAdmin();
    const { getSupabaseAdmin } = await import('@/lib/auth-server');
    const supabase = await getSupabaseAdmin();

    // 1. Update status to approved
    const { error } = await supabase
        .from('ringtones')
        .update({ status: 'approved' })
        .eq('id', id);

    if (error) return { success: false, error: error.message };

    // 2. Award points if userId provided
    if (userId) {
        try {
            const { awardPoints, checkUploadBadges, POINTS_PER_UPLOAD } = await import('@/lib/gamification');
            await awardPoints(supabase, userId, POINTS_PER_UPLOAD);
            await checkUploadBadges(supabase, userId);
        } catch (e) {
            console.warn('Gamification failed during approval:', e);
        }
    }

    // 3. Revalidate paths to update site immediately
    try {
        revalidatePath('/', 'layout'); // Force clear all
        revalidatePath('/admin/ringtones');

        // @ts-expect-error - revalidateTag has type issues in Next.js 16
        revalidateTag('homepage-artists'); // In case it affects stats
    } catch (e) {
        console.warn('Ringtone revalidation failed:', e);
    }

    return { success: true };
}

export async function rejectRingtone(id: string, reason?: string) {
    await ensureAdmin();
    const { getSupabaseAdmin } = await import('@/lib/auth-server');
    const supabase = await getSupabaseAdmin();

    // 1. Update status to rejected
    const { error } = await supabase
        .from('ringtones')
        .update({
            status: 'rejected',
            rejection_reason: reason || null
        })
        .eq('id', id);

    if (error) return { success: false, error: error.message };

    // 2. Revalidate paths
    try {
        revalidatePath('/', 'layout');
        revalidatePath('/admin/ringtones');
    } catch (e) {
        console.warn('Rejection revalidation failed:', e);
    }

    return { success: true };
}

export async function updateWithdrawalStatus(withdrawalId: string, status: 'completed' | 'rejected') {
    await ensureAdmin();
    const { getSupabaseAdmin } = await import('@/lib/auth-server');
    const supabase = await getSupabaseAdmin();

    // 1. Get the withdrawal record to find the user and amount
    const { data: withdrawal, error: fetchError } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('id', withdrawalId)
        .single();

    if (fetchError || !withdrawal) {
        return { success: false, error: 'Withdrawal request not found' };
    }

    // 2. If rejecting, we must refund the points
    if (status === 'rejected' && withdrawal.status === 'pending') {
        const { data: profile } = await supabase
            .from('profiles')
            .select('points')
            .eq('id', withdrawal.user_id)
            .single();

        if (profile) {
            const { error: refundError } = await supabase
                .from('profiles')
                .update({ points: (profile.points || 0) + withdrawal.amount })
                .eq('id', withdrawal.user_id);

            if (refundError) {
                console.error('Failed to refund points for rejected withdrawal:', refundError);
                return { success: false, error: 'Failed to refund points' };
            }
        }
    }

    // 3. Update the withdrawal status
    const { error: updateError } = await supabase
        .from('withdrawals')
        .update({
            status,
            updated_at: new Date().toISOString()
        })
        .eq('id', withdrawalId);

    if (updateError) {
        return { success: false, error: updateError.message };
    }

    try {
        revalidatePath('/admin/withdrawals');
        revalidatePath('/profile');
    } catch (e) {
        console.warn('Revalidation failed:', e);
    }

    return { success: true };
}

export async function deleteRingtone(id: string) {
    try {
        await ensureAdmin();
        const { getSupabaseAdmin } = await import('@/lib/auth-server');
        const supabase = await getSupabaseAdmin();

        // 1. Get ringtone data first to delete from storage if needed
        const { data: ringtone } = await supabase
            .from('ringtones')
            .select('audio_url, audio_url_iphone, poster_url')
            .eq('id', id)
            .single();

        // 2. Delete from database (RLS bypass with admin client)
        const { error } = await supabase
            .from('ringtones')
            .delete()
            .eq('id', id);

        if (error) return { success: false, error: error.message };

        // 3. Clear cache
        revalidatePath('/');
        revalidatePath('/admin/ringtones');
        revalidatePath('/recent');

        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message || 'Failed to delete ringtone' };
    }
}
