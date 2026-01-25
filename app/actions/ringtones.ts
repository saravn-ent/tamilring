'use server'

import { revalidateTag, revalidatePath, unstable_cache } from 'next/cache'
import { getSupabaseServer } from '@/lib/auth-server'
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

// Helper for public data fetching (No cookies/auth) to be safe for unstable_cache
const getPublicSupabase = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
};

export async function incrementLikes(ringtoneId: string) {
    const supabase = await getSupabaseServer() // Uses cookies for RLS if user logged in, but works anonymously too usually if table allows

    // Try RPC first (atomic)
    const { error: rpcError } = await supabase.rpc('increment_likes', { row_id: ringtoneId })

    if (!rpcError) return { success: true }

    // Fallback: Fetch and Update (non-atomic)
    const { data: ringtone, error: fetchError } = await supabase
        .from('ringtones')
        .select('likes')
        .eq('id', ringtoneId)
        .single()

    if (fetchError || !ringtone) return { success: false, error: fetchError }

    const { error: updateError } = await supabase
        .from('ringtones')
        .update({ likes: (ringtone.likes || 0) + 1 })
        .eq('id', ringtoneId)

    if (updateError) return { success: false, error: updateError }

    return { success: true }
}

export async function incrementDownloads(ringtoneId: string) {
    const supabase = await getSupabaseServer()

    // Try RPC first (atomic)
    const { error: rpcError } = await supabase.rpc('increment_downloads', { row_id: ringtoneId })

    if (!rpcError) return { success: true }

    // Fallback: Fetch and Update (non-atomic)
    const { data: ringtone, error: fetchError } = await supabase
        .from('ringtones')
        .select('downloads')
        .eq('id', ringtoneId)
        .single()

    if (fetchError || !ringtone) return { success: false, error: fetchError }

    const { error: updateError } = await supabase
        .from('ringtones')
        .update({ downloads: (ringtone.downloads || 0) + 1 })
        .eq('id', ringtoneId)

    if (updateError) return { success: false, error: updateError }

    // Log analytics (Fire & Forget mostly, but we await to ensure it happens)
    try {
        await supabase.from('download_logs').insert({
            ringtone_id: ringtoneId,
            // user_id will be null since this is public action usually, 
            // unless we grab it from auth.getUser(), but let's keep it simple for speed
        });
    } catch (logErr) {
        console.warn('Analytics log failed:', logErr);
    }

    return { success: true }
}

export async function revalidateArtistCache() {
    try {
        // Current Next.js types for server actions can be strict about void/return types
        // @ts-expect-error - revalidateTag returns void, but we wrap it for safety
        revalidateTag('homepage-artists')
        revalidatePath('/', 'page') // Stronger refresh for homepage
    } catch (e) {
        console.error('Revalidation failed:', e)
    }
    return { success: true, timestamp: Date.now() }
}

export async function notifyAdminOnUpload(ringtoneData: {
    title: string;
    movie_name: string;
    user_id: string;
    tags?: string[];
    slug?: string;
}) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return { success: false, error: 'No webhook URL configured' };

    try {
        const embed = {
            title: "🎵 New Ringtone Uploaded (Auto-Approved)",
            url: `https://tamilring.in/ringtone/${ringtoneData.slug}`, // Link to live ringtone
            color: 5090150, // #4DAC66
            fields: [
                { name: "Title", value: ringtoneData.title, inline: true },
                { name: "Movie", value: ringtoneData.movie_name, inline: true },
                { name: "User", value: ringtoneData.user_id, inline: false },
                { name: "Tags", value: Array.isArray(ringtoneData.tags) ? ringtoneData.tags.join(', ') : "None", inline: false }
            ],
            timestamp: new Date().toISOString(),
            footer: { text: "TamilRing Admin Bot" }
        };

        const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: "New upload live on site!",
                embeds: [embed]
            })
        });

        if (!res.ok) throw new Error(`Discord API Status: ${res.status}`);

        return { success: true };
    } catch (e) {
        console.error('Notification failed:', e);
        return { success: false }; // Fail silently for user
    }
}

export const getTrendingRingtones = unstable_cache(
    async (limit: number = 10) => {
        const supabase = getPublicSupabase();
        const { data, error } = await supabase.rpc('get_trending_ringtones', { limit_count: limit });
        if (error) {
            console.warn('Trending RPC failed, falling back to recent', error);
            const { data: fallback } = await supabase
                .from('ringtones')
                .select('*')
                .eq('status', 'approved')
                .order('created_at', { ascending: false })
                .limit(limit);
            return fallback || [];
        }
        return data || [];
    },
    ['trending-ringtones'],
    { revalidate: 3600, tags: ['trending'] }
);

export const getTopAlbums = unstable_cache(
    async (limit: number = 10) => {
        const supabase = getPublicSupabase();
        const { data, error } = await supabase.rpc('get_top_albums_v2', { limit_count: limit });
        if (error) {
            console.warn('Top Albums RPC failed', error);
            return [];
        }
        return data || [];
    },
    ['top-albums'],
    { revalidate: 3600, tags: ['top-albums'] }
);

export async function logSearch(query: string) {
    if (!query || query.trim().length <= 2) return { success: false };

    const normalized = query.toLowerCase().trim()
        .replace(/ringtone|song|bgm|music/g, '') // Basic noise removal
        .trim();

    if (!normalized) return { success: false };

    try {
        const supabase = await getSupabaseServer();
        const headerList = await headers();
        const ip = headerList.get('x-forwarded-for') || 'unknown';

        // Use Web Crypto API instead of Node.js crypto
        const encoder = new TextEncoder();
        const data = encoder.encode(ip);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const ipHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Check for Auth User
        const { data: { user } } = await supabase.auth.getUser();

        await supabase.from('search_logs').insert({
            query: query.trim(),
            normalized_query: normalized,
            ip_hash: ipHash,
            user_id: user?.id || null
        });

        return { success: true };
    } catch (e) {
        // Fail silently to not disrupt user experience
        console.error('Search log error:', e);
        return { success: false };
    }
}

export const getTrendingTags = unstable_cache(
    async (limit: number = 8) => {
        const supabase = getPublicSupabase();
        const allTags = new Map<string, number>();

        // 1. Fetch Search Trends (High Priority)
        try {
            const { data: searchTrends } = await supabase.rpc('get_trending_search_tags', { limit_count: 5 });
            if (searchTrends) {
                searchTrends.forEach((t: { tag: string, score: number }) => {
                    if (t.tag) allTags.set(t.tag, (allTags.get(t.tag) || 0) + (t.score * 5)); // Higher weight for searches
                });
            }
        } catch (e) {
            console.warn('Search trends fetch failed', e);
        }

        // 2. Fetch Content Trends (Backup/Volume)
        try {
            const trendingRingtones = await getTrendingRingtones(20);
            trendingRingtones.forEach((r: any) => {
                // Use movie name and tags
                if (r.tags && Array.isArray(r.tags)) {
                    r.tags.forEach((t: string) => {
                        allTags.set(t, (allTags.get(t) || 0) + 1);
                    });
                }
                // Also add movie name as a potential tag
                if (r.movie_name) {
                    allTags.set(r.movie_name, (allTags.get(r.movie_name) || 0) + 2);
                }
            });
        } catch (e) {
            console.warn('Content trends fetch failed', e);
        }

        // Sort and cleanup
        const sorted = Array.from(allTags.entries())
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0])
            .filter(tag => tag && tag.length > 2) // Filter short garbage
            .slice(0, limit);

        // Fallback if empty
        if (sorted.length === 0) {
            return ['Love', 'BGM', 'Anirudh', 'Vijay'];
        }

        return sorted;
    },
    ['trending-tags'],
    { revalidate: 1800, tags: ['trending-tags'] } // Cache for 30 mins
);

/**
 * AI Similar Ringtones Recommendation System
 * Uses weighted content-based filtering (Tags, Mood, Music Director)
 */
export async function getSimilarRingtones(source: {
    id: string;
    tags?: string[];
    mood?: string;
    music_director?: string;
    movie_name?: string;
}, limit: number = 6) {
    const supabase = getPublicSupabase();

    try {
        // Query candidates that share some key attributes
        let query = supabase
            .from('ringtones')
            .select('*')
            .eq('status', 'approved')
            .neq('id', source.id);

        // Build some filters for relevance
        if (source.tags && source.tags.length > 0) {
            query = query.overlaps('tags', source.tags);
        } else if (source.movie_name) {
            query = query.eq('movie_name', source.movie_name);
        } else if (source.music_director) {
            query = query.eq('music_director', source.music_director);
        }

        const { data, error } = await query.limit(20);
        if (error) throw error;
        if (!data || data.length === 0) {
            // Final fallback: just get recent ones if no matches
            const { data: recents } = await supabase
                .from('ringtones')
                .select('*')
                .eq('status', 'approved')
                .neq('id', source.id)
                .order('created_at', { ascending: false })
                .limit(limit);
            return recents || [];
        }

        // Apply custom AI scoring logic on the candidates
        const scored = data.map(item => {
            let score = 0;
            // Tag overlap score
            const overlap = item.tags?.filter((t: string) => source.tags?.includes(t)).length || 0;
            score += overlap * 10;

            // Mood match
            if (item.mood === source.mood && source.mood) score += 15;

            // Same music director
            if (item.music_director === source.music_director && source.music_director) score += 20;

            // Same movie
            if (item.movie_name === source.movie_name) score += 30;

            return { item, score };
        });

        // Sort by score and return top results
        return scored
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(s => s.item);

    } catch (e) {
        console.error('Similarity search failed:', e);
        return [];
    }
}

export async function processAutoApproval(userId: string) {
    try {
        const { getSupabaseAdmin } = await import('@/lib/auth-server');
        const supabase = await getSupabaseAdmin();

        const { awardPoints, checkUploadBadges, POINTS_PER_UPLOAD } = await import('@/lib/gamification');

        // Award points
        await awardPoints(supabase, userId, POINTS_PER_UPLOAD);

        // Check for badges
        await checkUploadBadges(supabase, userId);

        // Revalidate to show new points immediately
        // @ts-ignore
        revalidateTag('user-profile');
        // @ts-ignore
        revalidateTag('recent');
        // @ts-ignore
        revalidateTag('trending');
        revalidatePath('/profile');
        revalidatePath('/', 'page');
        revalidatePath('/recent', 'page');

        return { success: true };
    } catch (e) {
        console.error('Auto-approval gamification failed:', e);
        return { success: false, error: 'Failed to award points' };
    }
}
