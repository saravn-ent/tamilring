
import { SupabaseClient } from '@supabase/supabase-js';

export const POINTS_PER_UPLOAD = 50;

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
    // 1. Get current profile to check level (optional in future)
    const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('points, level')
        .eq('id', userId)
        .single();

    if (fetchError || !profile) {
        console.error('Error fetching profile for points:', JSON.stringify(fetchError), 'UserId:', userId);
        return;
    }

    const newPoints = (profile.points || 0) + amount;

    // Simple Level Check: Level up every 500 points
    const newLevel = Math.floor(newPoints / 500) + 1;

    // 2. Update Profile
    const { error: updateError } = await supabase
        .from('profiles')
        .update({
            points: newPoints,
            level: newLevel
        })
        .eq('id', userId);

    if (updateError) {
        console.error('Error updating points:', updateError);
    } else {
        console.log(`Awarded ${amount} points to user ${userId}`);
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

    const correctPoints = count * POINTS_PER_UPLOAD;
    const correctLevel = Math.floor(correctPoints / 500) + 1;

    // 2. Get Current Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('points, level')
        .eq('id', userId)
        .single();

    if (!profile) return null;

    // 3. Update if discrepancies exist
    if (profile.points !== correctPoints || profile.level !== correctLevel) {
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                points: correctPoints,
                level: correctLevel
            })
            .eq('id', userId);

        if (updateError) {
            console.error('Error updating profile stats:', updateError);
        } else {
            console.log(`Synced user ${userId}: ${correctPoints} points, Level ${correctLevel}`);
        }
    }

    // 4. Ensure Badges are correct
    await checkUploadBadges(supabase, userId);

    return { points: correctPoints, level: correctLevel };
}
