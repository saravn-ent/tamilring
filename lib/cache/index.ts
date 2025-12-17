/**
 * Cache Module
 * Centralized caching system for TamilRing
 */

// Core cache client
export { cache, getCached, setCached } from './redis';

// Cache service
export {
    cacheGet,
    cacheSet,
    cacheDelete,
    cacheDeletePattern,
    cacheGetOrSet,
    cacheMGet,
    cacheMSet,
    cacheExists,
    cacheTTL,
    cacheIncrement,
    cacheDecrement,
    getCacheStats,
    resetCacheStats,
    warmCache,
    clearAllCache,
    isCacheAvailable,
} from './cache-service';

// Cache keys and TTLs
export { CacheKeys, CacheTTL, CacheTags, getCachePattern, generateCacheKey } from './cache-keys';

// Cache invalidation
export {
    invalidateHomepageCache,
    invalidateRingtoneCache,
    invalidateMovieCache,
    invalidateArtistCache,
    invalidateArtistTopLists,
    invalidateUserCache,
    invalidateSearchCache,
    invalidateStatsCache,
    onRingtoneUploaded,
    onRingtoneApproved,
    onRingtoneDeleted,
    onRingtoneStatsChanged,
    onUserProfileUpdated,
    scheduledCacheRefresh,
} from './cache-invalidation';

// Type exports
export type { CacheOptions, CacheStats } from './cache-service';
