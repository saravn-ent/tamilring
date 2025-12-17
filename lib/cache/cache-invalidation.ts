import { cacheDelete, cacheMSet } from './cache-service';
import { CacheKeys, CacheTTL } from './cache-keys';

/**
 * Cache invalidation utilities
 * Handles clearing cache when data changes
 */

/**
 * Invalidate homepage caches
 * Called when new ringtones are added or trending data changes
 */
export async function invalidateHomepageCache(): Promise<void> {
    console.log('[Cache Invalidation] Clearing homepage cache...');

    await Promise.all([
        cacheDelete(CacheKeys.homepage.trending()),
        cacheDelete(CacheKeys.homepage.topArtists()),
        cacheDelete(CacheKeys.homepage.topMovies()),
        cacheDelete(CacheKeys.homepage.topContributors()),
        cacheDelete(CacheKeys.homepage.recentRingtones()),
        cacheDelete(CacheKeys.stats.trending()),
        cacheDelete(CacheKeys.stats.popular()),
    ]);

    console.log('[Cache Invalidation] Homepage cache cleared');
}

/**
 * Invalidate ringtone cache
 * Called when a ringtone is updated, approved, or deleted
 */
export async function invalidateRingtoneCache(ringtoneId: string, slug?: string): Promise<void> {
    console.log(`[Cache Invalidation] Clearing ringtone cache for ${ringtoneId}...`);

    const promises = [
        cacheDelete(CacheKeys.ringtone.byId(ringtoneId)),
        cacheDelete(CacheKeys.ringtone.stats(ringtoneId)),
        cacheDelete(CacheKeys.ringtone.related(ringtoneId)),
    ];

    if (slug) {
        promises.push(cacheDelete(CacheKeys.ringtone.bySlug(slug)));
    }

    await Promise.all(promises);

    console.log(`[Cache Invalidation] Ringtone cache cleared for ${ringtoneId}`);
}

/**
 * Invalidate movie cache
 * Called when movie data or its ringtones change
 */
export async function invalidateMovieCache(movieName: string): Promise<void> {
    console.log(`[Cache Invalidation] Clearing movie cache for ${movieName}...`);

    await Promise.all([
        cacheDelete(CacheKeys.movie.byName(movieName)),
        cacheDelete(CacheKeys.movie.ringtones(movieName)),
        cacheDelete(CacheKeys.movie.stats(movieName)),
    ]);

    console.log(`[Cache Invalidation] Movie cache cleared for ${movieName}`);
}

/**
 * Invalidate artist cache
 * Called when artist data or their ringtones change
 */
export async function invalidateArtistCache(artistName: string): Promise<void> {
    console.log(`[Cache Invalidation] Clearing artist cache for ${artistName}...`);

    await Promise.all([
        cacheDelete(CacheKeys.artist.byName(artistName)),
        cacheDelete(CacheKeys.artist.ringtones(artistName)),
        cacheDelete(CacheKeys.artist.stats(artistName)),
    ]);

    console.log(`[Cache Invalidation] Artist cache cleared for ${artistName}`);
}

/**
 * Invalidate all artist top lists
 * Called when global artist rankings change
 */
export async function invalidateArtistTopLists(): Promise<void> {
    console.log('[Cache Invalidation] Clearing artist top lists...');

    await Promise.all([
        cacheDelete(CacheKeys.artist.topSingers()),
        cacheDelete(CacheKeys.artist.topMusicDirectors()),
        cacheDelete(CacheKeys.artist.topMovieDirectors()),
    ]);

    console.log('[Cache Invalidation] Artist top lists cleared');
}

/**
 * Invalidate user cache
 * Called when user profile or ringtones change
 */
export async function invalidateUserCache(userId: string): Promise<void> {
    console.log(`[Cache Invalidation] Clearing user cache for ${userId}...`);

    await Promise.all([
        cacheDelete(CacheKeys.user.profile(userId)),
        cacheDelete(CacheKeys.user.ringtones(userId)),
        cacheDelete(CacheKeys.user.stats(userId)),
        cacheDelete(CacheKeys.user.gamification(userId)),
    ]);

    console.log(`[Cache Invalidation] User cache cleared for ${userId}`);
}

/**
 * Invalidate search cache
 * Called when search index needs refresh
 */
export async function invalidateSearchCache(query?: string): Promise<void> {
    if (query) {
        console.log(`[Cache Invalidation] Clearing search cache for "${query}"...`);
        await cacheDelete(CacheKeys.search.query(query));
        await cacheDelete(CacheKeys.search.autocomplete(query));
    } else {
        console.log('[Cache Invalidation] Clearing all search cache...');
        // Note: This would require pattern matching which Upstash doesn't support directly
        // We'll need to track search keys separately or use a different approach
    }

    console.log('[Cache Invalidation] Search cache cleared');
}

/**
 * Invalidate global stats cache
 * Called when site-wide statistics change
 */
export async function invalidateStatsCache(): Promise<void> {
    console.log('[Cache Invalidation] Clearing stats cache...');

    await Promise.all([
        cacheDelete(CacheKeys.stats.global()),
        cacheDelete(CacheKeys.stats.trending()),
        cacheDelete(CacheKeys.stats.popular()),
    ]);

    console.log('[Cache Invalidation] Stats cache cleared');
}

/**
 * Comprehensive invalidation when a ringtone is uploaded
 * Clears all related caches
 */
export async function onRingtoneUploaded(data: {
    ringtoneId: string;
    userId: string;
    movieName?: string;
    artists?: string[];
}): Promise<void> {
    console.log('[Cache Invalidation] Ringtone uploaded - invalidating caches...');

    const promises: Promise<void>[] = [
        invalidateUserCache(data.userId),
        invalidateHomepageCache(),
    ];

    if (data.movieName) {
        promises.push(invalidateMovieCache(data.movieName));
    }

    if (data.artists && data.artists.length > 0) {
        promises.push(...data.artists.map(artist => invalidateArtistCache(artist)));
        promises.push(invalidateArtistTopLists());
    }

    await Promise.all(promises);

    console.log('[Cache Invalidation] Ringtone upload invalidation complete');
}

/**
 * Comprehensive invalidation when a ringtone is approved
 * Clears all related caches and updates stats
 */
export async function onRingtoneApproved(data: {
    ringtoneId: string;
    slug: string;
    userId: string;
    movieName?: string;
    artists?: string[];
}): Promise<void> {
    console.log('[Cache Invalidation] Ringtone approved - invalidating caches...');

    const promises: Promise<void>[] = [
        invalidateRingtoneCache(data.ringtoneId, data.slug),
        invalidateUserCache(data.userId),
        invalidateHomepageCache(),
        invalidateStatsCache(),
    ];

    if (data.movieName) {
        promises.push(invalidateMovieCache(data.movieName));
    }

    if (data.artists && data.artists.length > 0) {
        promises.push(...data.artists.map(artist => invalidateArtistCache(artist)));
        promises.push(invalidateArtistTopLists());
    }

    await Promise.all(promises);

    console.log('[Cache Invalidation] Ringtone approval invalidation complete');
}

/**
 * Comprehensive invalidation when a ringtone is deleted
 */
export async function onRingtoneDeleted(data: {
    ringtoneId: string;
    slug: string;
    userId: string;
    movieName?: string;
    artists?: string[];
}): Promise<void> {
    console.log('[Cache Invalidation] Ringtone deleted - invalidating caches...');

    const promises: Promise<void>[] = [
        invalidateRingtoneCache(data.ringtoneId, data.slug),
        invalidateUserCache(data.userId),
        invalidateHomepageCache(),
        invalidateStatsCache(),
    ];

    if (data.movieName) {
        promises.push(invalidateMovieCache(data.movieName));
    }

    if (data.artists && data.artists.length > 0) {
        promises.push(...data.artists.map(artist => invalidateArtistCache(artist)));
        promises.push(invalidateArtistTopLists());
    }

    await Promise.all(promises);

    console.log('[Cache Invalidation] Ringtone deletion invalidation complete');
}

/**
 * Invalidation when ringtone stats change (likes, downloads)
 */
export async function onRingtoneStatsChanged(data: {
    ringtoneId: string;
    slug: string;
    movieName?: string;
}): Promise<void> {
    console.log('[Cache Invalidation] Ringtone stats changed - invalidating caches...');

    const promises: Promise<void>[] = [
        cacheDelete(CacheKeys.ringtone.stats(data.ringtoneId)),
        cacheDelete(CacheKeys.stats.trending()),
        cacheDelete(CacheKeys.stats.popular()),
    ];

    if (data.movieName) {
        promises.push(cacheDelete(CacheKeys.movie.stats(data.movieName)));
    }

    await Promise.all(promises);

    console.log('[Cache Invalidation] Ringtone stats invalidation complete');
}

/**
 * Invalidation when user profile is updated
 */
export async function onUserProfileUpdated(userId: string): Promise<void> {
    console.log(`[Cache Invalidation] User profile updated - invalidating cache for ${userId}...`);

    await invalidateUserCache(userId);

    console.log('[Cache Invalidation] User profile invalidation complete');
}

/**
 * Scheduled cache refresh
 * Call this periodically to refresh trending/popular data
 */
export async function scheduledCacheRefresh(): Promise<void> {
    console.log('[Cache Invalidation] Scheduled refresh - clearing volatile caches...');

    await Promise.all([
        cacheDelete(CacheKeys.homepage.trending()),
        cacheDelete(CacheKeys.stats.trending()),
        cacheDelete(CacheKeys.stats.popular()),
    ]);

    console.log('[Cache Invalidation] Scheduled refresh complete');
}
