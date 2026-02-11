
import { SupabaseClient } from '@supabase/supabase-js';

export const POINTS_PER_UPLOAD = 10;
export const POINTS_COST_REQUEST = 10;

export const LEVEL_TITLES = {
    1: 'Listener',
    2: 'Creator',
    3: 'Composer',
    4: 'Maestro',
    5: 'Legend'
};

export function getLevelTitle(level: number): string {
    // @ts-ignore
    return LEVEL_TITLES[level] || `Level ${level}`;
}


export async function awardPoints(supabase: SupabaseClient, userId: string, amount: number) {
    // secure, atomic RPC call
    const { error } = await supabase.rpc('award_points_securely', {
        target_user_id: userId,
        amount: amount
    });

    if (error) {
        console.error('Error awarding points (RPC):', error);
    } else {
        console.log(`Awarded ${amount} points to user ${userId} (Secure RPC)`);
    }
}

export async function checkUploadBadges(supabase: SupabaseClient, userId: string) {
    // 1. Get Upload Count
    const { count, error: countError } = await supabase
        .from('ringtones')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'approved');

    if (countError || count === null) return;

    // 2. Get Eligible Badges
    const { data: eligibleBadges } = await supabase
        .from('badges')
        .select('*')
        .eq('condition_type', 'uploads_count')
        .lte('condition_value', count);

    if (!eligibleBadges || eligibleBadges.length === 0) return;

    // 3. Award Badges (Insert if not exists)
    for (const badge of eligibleBadges) {
        await supabase
            .from('user_badges')
            .upsert(
                { user_id: userId, badge_id: badge.id },
                { onConflict: 'user_id, badge_id', ignoreDuplicates: true }
            );
    }
}

export async function syncUserGamification(supabase: SupabaseClient, userId: string) {
    // 1. Get Actual Approved Upload Count
    const { count, error } = await supabase
        .from('ringtones')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'approved');

    if (error || count === null) {
        console.error('Error syncing gamification:', error);
        return null;
    }

    // 2. Get Withdrawals (Pending or Completed)
    const { data: withdrawals, error: withdrawalError } = await supabase
        .from('withdrawals')
        .select('amount, status')
        .eq('user_id', userId)
        .in('status', ['pending', 'completed']);

    if (withdrawalError) {
        console.error('Error fetching withdrawals for sync:', withdrawalError);
        return null; // Safety abort
    }

    const totalWithdrawn = withdrawals?.reduce((sum, w) => sum + Math.max(0, w.amount), 0) || 0;

    // 3. Get Ringtone Requests (for point deduction)
    const { data: ringtoneRequests, error: requestError } = await supabase
        .from('ringtone_requests')
        .select('*')
        .eq('user_id', userId);

    if (requestError) {
        console.error('Error fetching requests for sync:', requestError);
        return null;
    }

    const totalRequestDeduction = (ringtoneRequests?.length || 0) * POINTS_COST_REQUEST;

    // 4. Get Current Profile for Bonus Check
    const { data: profile } = await supabase
        .from('profiles')
        .select('points, level, is_first_upload_rewarded')
        .eq('id', userId)
        .single();

    if (!profile) return null;

    // 5. Calculate Correct Values
    let lifetimePoints = count * POINTS_PER_UPLOAD;

    // Add First Upload Bonus if applicable
    if (profile.is_first_upload_rewarded) {
        lifetimePoints += 15;
    }

    const currentBalance = lifetimePoints - totalWithdrawn - totalRequestDeduction;
    const correctLevel = Math.floor(lifetimePoints / 500) + 1; // Level based on Lifetime Earnings

    // 5. Update if discrepancies exist
    if (profile.points !== currentBalance || profile.level !== correctLevel) {
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                points: currentBalance,
                level: correctLevel
            })
            .eq('id', userId);

        if (updateError) {
            console.error('Error updating profile stats:', updateError);
        } else {
            console.log(`Synced user ${userId}: Balance ${currentBalance} (Lifetime ${lifetimePoints}), Level ${correctLevel}`);
        }
    }

    // 6. Ensure Badges are correct
    await checkUploadBadges(supabase, userId);

    return {
        points: currentBalance,
        level: correctLevel,
        totalWithdrawn,
        lifetimePoints
    };
}
