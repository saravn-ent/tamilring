'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { ensureAdmin, getSupabaseAdmin } from '@/lib/auth-server'
import { Ringtone } from '@/types'
import { awardPoints, checkUploadBadges, POINTS_PER_UPLOAD } from '@/lib/gamification'

export async function approveRingtone(id: string, userId?: string) {
    try {
        await ensureAdmin();
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[AdminAction] approveRingtone: Auth Failed:', error);
        return { success: false, error: `Authentication Failed: ${message}` };
    }

    const supabase = await getSupabaseAdmin();

    // 1. Update status to approved
    const { error, count } = await supabase
        .from('ringtones')
        .update({ status: 'approved' }, { count: 'exact' })
        .eq('id', id);

    if (error) return { success: false, error: error.message };
    if (count === 0) return { success: false, error: 'Operation failed: Record not found or Permission Denied (Check Service Role Key)' };

    // 2. Award points if userId provided
    if (userId) {
        try {
            // Standard Points
            await awardPoints(supabase, userId, POINTS_PER_UPLOAD);

            // First Upload Bonus (15 Points)
            const { data: profile, error: profileErr } = await supabase
                .from('profiles')
                .select('is_first_upload_rewarded, points')
                .eq('id', userId)
                .single();

            if (profile && !profile.is_first_upload_rewarded) {
                const { error: updateErr } = await supabase.from('profiles').update({
                    is_first_upload_rewarded: true,
                    points: (profile.points || 0) + 15
                }).eq('id', userId);

                if (updateErr) console.error('[AdminAction] Failed to award first upload bonus:', updateErr);
            }

            // Badges
            await checkUploadBadges(supabase, userId);
        } catch (e) {
            console.warn('[AdminAction] Gamification failed during approval:', e);
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
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: `Authentication Failed: ${message}` };
    }

    if (!ids.length) return { success: true };

    const { getSupabaseAdmin } = await import('@/lib/auth-server');
    const supabase = await getSupabaseAdmin();

    // 1. Update status to approved for ALL ids
    const { error, count } = await supabase
        .from('ringtones')
        .update({ status: 'approved' }, { count: 'exact' })
        .in('id', ids);

    if (error) return { success: false, error: error.message };
    if (count === 0 && ids.length > 0) return { success: false, error: 'Operation failed: No records updated (Check Service Role Key)' };

    // 2. Award points - we need to fetch user_ids for these ringtones first
    // This might be heavy, so we'll do it in a background-ish way or simplified
    try {
        const { data: ringtones } = await supabase
            .from('ringtones')
            .select('user_id')
            .in('id', ids);

        if (ringtones) {
            // Sequentially or parallel award points
            // simple loop for now
            for (const r of ringtones) {
                if (r.user_id) {
                    await awardPoints(supabase, r.user_id, POINTS_PER_UPLOAD).catch(() => { });
                }
            }
        }
    } catch (e) {
        console.warn('[AdminAction] Gamification failed during bulk approval:', e);
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
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: `Authentication Failed: ${message}` };
    }

    const { getSupabaseAdmin } = await import('@/lib/auth-server');
    const supabase = await getSupabaseAdmin();

    // 1. Update status to rejected
    const { error, count } = await supabase
        .from('ringtones')
        .update({
            status: 'rejected',
            rejection_reason: reason || null
        }, { count: 'exact' })
        .eq('id', id);

    if (error) return { success: false, error: error.message };
    if (count === 0) return { success: false, error: 'Operation failed: Record not found or Permission Denied (Check Service Role Key)' };

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
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[AdminAction] updateWithdrawalStatus: Auth Failed:', error);
        return { success: false, error: `Authentication Failed: ${message}` };
    }

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

    // 2. Update the withdrawal status in the database
    const { error: updateError, count } = await supabase
        .from('withdrawals')
        .update({
            status,
            updated_at: new Date().toISOString()
        }, { count: 'exact' })
        .eq('id', withdrawalId);

    if (updateError) {
        console.error('[AdminAction] Failed to update withdrawal status:', updateError);
        return { success: false, error: updateError.message };
    }

    if (count === 0) {
        console.error('[AdminAction] Withdrawal status update failed: No rows affected');
        return { success: false, error: "Operation failed: Entry not found or already processed" };
    }

    // 4. Sync the user's gamification to ensure points column is accurate after status change
    // This handles both completion (stays deducted) and rejection (refunded)
    try {
        const { syncUserGamification } = await import('@/lib/gamification');
        await syncUserGamification(supabase, withdrawal.user_id);
    } catch (e) {
        console.warn('Gamification sync failed after status update:', e);
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
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return { success: false, error: `Authentication Failed: ${message}` };
        }

        const { getSupabaseAdmin } = await import('@/lib/auth-server');
        const supabase = await getSupabaseAdmin();

        // 1. Get ringtone data first to delete from storage if needed
        const { data: ringtone } = await supabase
            .from('ringtones')
            .select('audio_url, audio_url_iphone, poster_url, user_id')
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
        const { error, count } = await supabase
            .from('ringtones')
            .delete({ count: 'exact' })
            .eq('id', id);

        if (error) return { success: false, error: error.message };
        if (count === 0) return { success: false, error: 'Operation failed: Record not found or Permission Denied (Check Service Role Key)' };

        // 3. Clear cache
        // Revalidate specific tags used in home page components
        try {
            // @ts-expect-error - revalidateTag has types issues in some Next versions
            revalidateTag('contributors');
            // @ts-expect-error
            revalidateTag('trending');
            // @ts-expect-error
            revalidateTag('recent');

            revalidatePath('/');
            revalidatePath('/admin/ringtones');
            revalidatePath('/recent');

            // Revalidate User Profile if user exists
            if (ringtone?.user_id) {
                revalidatePath(`/user/${ringtone.user_id}`);
                revalidatePath('/profile');
            }
        } catch (e) {
            console.warn('Cache revalidation failed:', e);
        }

        return { success: true };
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to delete ringtone';
        return { success: false, error: message };
    }
}

export async function bulkDeleteRingtones(ids: string[]) {
    try {
        await ensureAdmin();
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: `Authentication Failed: ${message}` };
    }

    if (!ids.length) return { success: true };

    const { getSupabaseAdmin } = await import('@/lib/auth-server');
    const supabase = await getSupabaseAdmin();

    // 1. Fetch all to get file paths
    const { data: ringtones } = await supabase
        .from('ringtones')
        .select('audio_url, audio_url_iphone, user_id')
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
    const { error, count } = await supabase
        .from('ringtones')
        .delete({ count: 'exact' })
        .in('id', ids);

    if (error) return { success: false, error: error.message };
    if (count === 0 && ids.length > 0) return { success: false, error: 'Operation failed: No records deleted (Check Service Role Key)' };

    // 3. Revalidate
    try {
        // @ts-expect-error
        revalidateTag('contributors');
        // @ts-expect-error
        revalidateTag('trending');
        // @ts-expect-error
        revalidateTag('recent');

        revalidatePath('/', 'layout');
        revalidatePath('/admin/ringtones');
        revalidatePath('/recent');

        // Revalidate all affected users
        if (ringtones) {
            const userIds = new Set(ringtones.map(r => r.user_id).filter(Boolean));
            userIds.forEach(uid => {
                revalidatePath(`/user/${uid}`);
            });
            if (userIds.size > 0) revalidatePath('/profile');
        }
    } catch (e) {
        console.warn('Revalidation failed:', e);
    }

    return { success: true };
}

export async function updateRingtoneMetadata(id: string, data: Partial<Ringtone>) {
    try {
        await ensureAdmin();
        const { getSupabaseAdmin } = await import('@/lib/auth-server');
        const supabase = await getSupabaseAdmin();

        const { error, count } = await supabase
            .from('ringtones')
            .update(data, { count: 'exact' })
            .eq('id', id);

        if (error) throw error;
        if (count === 0) throw new Error('Operation failed: Record not found or Permission Denied (Check Service Role Key)');
        revalidatePath('/admin/ringtones');
        return { success: true };
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        return { success: false, error: message };
    }
}

export async function toggleUserRole(userId: string, role: 'user' | 'admin') {
    try {
        await ensureAdmin();
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: `Authentication Failed: ${message}` };
    }

    const { getSupabaseAdmin } = await import('@/lib/auth-server');
    const supabase = await getSupabaseAdmin();

    const { error, count } = await supabase
        .from('profiles')
        .update({ role }, { count: 'exact' })
        .eq('id', userId);

    if (error) return { success: false, error: error.message };
    if (count === 0) return { success: false, error: 'Operation failed: User not found or Permission Denied (Check Service Role Key)' };

    try {
        revalidatePath('/admin/users');
    } catch (e) {
        console.warn('Revalidation failed:', e);
    }

    return { success: true };
}
