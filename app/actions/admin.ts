'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { ensureAdmin } from '@/lib/auth-server'

export async function approveRingtone(id: string, userId?: string) {
    try {
        await ensureAdmin();
    } catch (error: any) {
        console.error('Admin Check Failed:', error);
        return { success: false, error: `Authentication Failed: ${error.message}` };
    }

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

            // Standard Points
            await awardPoints(supabase, userId, POINTS_PER_UPLOAD);

            // First Upload Bonus (15 Points)
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_first_upload_rewarded, points')
                .eq('id', userId)
                .single();

            if (profile && !profile.is_first_upload_rewarded) {
                await supabase.from('profiles').update({
                    is_first_upload_rewarded: true,
                    points: (profile.points || 0) + 15
                }).eq('id', userId);
            }

            // Badges
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

export async function bulkApproveRingtones(ids: string[]) {
    try {
        await ensureAdmin();
    } catch (error: any) {
        return { success: false, error: `Authentication Failed: ${error.message}` };
    }

    if (!ids.length) return { success: true };

    const { getSupabaseAdmin } = await import('@/lib/auth-server');
    const supabase = await getSupabaseAdmin();

    // 1. Update status to approved for ALL ids
    const { error } = await supabase
        .from('ringtones')
        .update({ status: 'approved' })
        .in('id', ids);

    if (error) return { success: false, error: error.message };

    // 2. Award points - we need to fetch user_ids for these ringtones first
    // This might be heavy, so we'll do it in a background-ish way or simplified
    try {
        const { data: ringtones } = await supabase
            .from('ringtones')
            .select('user_id')
            .in('id', ids);

        if (ringtones) {
            const { awardPoints, POINTS_PER_UPLOAD } = await import('@/lib/gamification');
            // Sequentially or parallel award points
            // simple loop for now
            for (const r of ringtones) {
                if (r.user_id) {
                    await awardPoints(supabase, r.user_id, POINTS_PER_UPLOAD).catch(() => { });
                }
            }
        }
    } catch (e) {
        console.warn('Gamification failed during bulk approval:', e);
    }

    // 3. Revalidate
    try {
        revalidatePath('/', 'layout');
        revalidatePath('/admin/ringtones');
    } catch (e) {
        console.warn('Revalidation failed:', e);
    }

    return { success: true };
}

export async function rejectRingtone(id: string, reason?: string) {
    try {
        await ensureAdmin();
    } catch (error: any) {
        return { success: false, error: `Authentication Failed: ${error.message}` };
    }

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
    try {
        await ensureAdmin();
    } catch (error: any) {
        return { success: false, error: `Authentication Failed: ${error.message}` };
    }

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
        try {
            await ensureAdmin();
        } catch (error: any) {
            return { success: false, error: `Authentication Failed: ${error.message}` };
        }

        const { getSupabaseAdmin } = await import('@/lib/auth-server');
        const supabase = await getSupabaseAdmin();

        // 1. Get ringtone data first to delete from storage if needed
        const { data: ringtone } = await supabase
            .from('ringtones')
            .select('audio_url, audio_url_iphone, poster_url')
            .eq('id', id)
            .single();

        if (ringtone) {
            const filesToDelete = [];

            const extractPath = (url: string) => {
                try {
                    if (!url) return null;
                    const parts = url.split('/ringtone-files/');
                    return parts.length > 1 ? parts[1] : null;
                } catch (e) { return null; }
            };

            if (ringtone.audio_url) {
                const path = extractPath(ringtone.audio_url);
                if (path) filesToDelete.push(path);
            }
            if (ringtone.audio_url_iphone) {
                const path = extractPath(ringtone.audio_url_iphone);
                if (path) filesToDelete.push(path);
            }

            // Note: Poster might be external or shared, implement specific logic if needed. 
            // For now, only deleting audio files to be safe, or if it's stored in 'ringtone-files'
            if (ringtone.poster_url && ringtone.poster_url.includes('/ringtone-files/')) {
                const path = extractPath(ringtone.poster_url);
                if (path) filesToDelete.push(path);
            }

            if (filesToDelete.length > 0) {
                await supabase.storage
                    .from('ringtone-files')
                    .remove(filesToDelete);
            }
        }

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

export async function bulkDeleteRingtones(ids: string[]) {
    try {
        await ensureAdmin();
    } catch (error: any) {
        return { success: false, error: `Authentication Failed: ${error.message}` };
    }

    if (!ids.length) return { success: true };

    const { getSupabaseAdmin } = await import('@/lib/auth-server');
    const supabase = await getSupabaseAdmin();

    // 1. Fetch all to get file paths
    const { data: ringtones } = await supabase
        .from('ringtones')
        .select('audio_url, audio_url_iphone')
        .in('id', ids);

    if (ringtones) {
        const filesToDelete: string[] = [];
        const extractPath = (url: string) => {
            const parts = url.split('/ringtone-files/');
            return parts.length > 1 ? parts[1] : null;
        };

        ringtones.forEach(r => {
            if (r.audio_url) { const p = extractPath(r.audio_url); if (p) filesToDelete.push(p); }
            if (r.audio_url_iphone) { const p = extractPath(r.audio_url_iphone); if (p) filesToDelete.push(p); }
        })

        if (filesToDelete.length > 0) {
            await supabase.storage.from('ringtone-files').remove(filesToDelete).catch(() => { });
        }
    }

    // 2. Bulk Delete from DB
    const { error } = await supabase
        .from('ringtones')
        .delete()
        .in('id', ids);

    if (error) return { success: false, error: error.message };

    // 3. Revalidate
    try {
        revalidatePath('/', 'layout');
        revalidatePath('/admin/ringtones');
    } catch (e) {
        console.warn('Revalidation failed:', e);
    }

    return { success: true };
}

export async function updateRingtoneMetadata(id: string, data: any) {
    try {
        await ensureAdmin();
        const { getSupabaseAdmin } = await import('@/lib/auth-server');
        const supabase = await getSupabaseAdmin();

        const { error } = await supabase
            .from('ringtones')
            .update(data)
            .eq('id', id);

        if (error) throw error;
        revalidatePath('/admin/ringtones');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function toggleUserRole(userId: string, role: 'user' | 'admin') {
    try {
        await ensureAdmin();
    } catch (error: any) {
        return { success: false, error: `Authentication Failed: ${error.message}` };
    }

    const { getSupabaseAdmin } = await import('@/lib/auth-server');
    const supabase = await getSupabaseAdmin();

    const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

    if (error) return { success: false, error: error.message };

    try {
        revalidatePath('/admin/users');
    } catch (e) {
        console.warn('Revalidation failed:', e);
    }

    return { success: true };
}
