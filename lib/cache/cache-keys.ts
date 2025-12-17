/**
 * Centralized cache key generation
 * Ensures consistent naming and easy invalidation
 */

export const CacheKeys = {
    // Homepage caches
    homepage: {
        trending: () => 'homepage:trending',
        topArtists: () => 'homepage:top-artists',
        topMovies: () => 'homepage:top-movies',
        topContributors: () => 'homepage:top-contributors',
        recentRingtones: () => 'homepage:recent-ringtones',
    },

    // Ringtone caches
    ringtone: {
        byId: (id: string) => `ringtone:id:${id}`,
        bySlug: (slug: string) => `ringtone:slug:${slug}`,
        related: (id: string) => `ringtone:related:${id}`,
        stats: (id: string) => `ringtone:stats:${id}`,
    },

    // Movie caches
    movie: {
        byName: (name: string) => `movie:name:${encodeURIComponent(name)}`,
        ringtones: (name: string) => `movie:ringtones:${encodeURIComponent(name)}`,
        stats: (name: string) => `movie:stats:${encodeURIComponent(name)}`,
    },

    // Artist caches
    artist: {
        byName: (name: string) => `artist:name:${encodeURIComponent(name)}`,
        ringtones: (name: string) => `artist:ringtones:${encodeURIComponent(name)}`,
        stats: (name: string) => `artist:stats:${encodeURIComponent(name)}`,
        topSingers: () => 'artist:top-singers',
        topMusicDirectors: () => 'artist:top-music-directors',
        topMovieDirectors: () => 'artist:top-movie-directors',
    },

    // User caches
    user: {
        profile: (userId: string) => `user:profile:${userId}`,
        ringtones: (userId: string) => `user:ringtones:${userId}`,
        stats: (userId: string) => `user:stats:${userId}`,
        gamification: (userId: string) => `user:gamification:${userId}`,
    },

    // Search caches
    search: {
        query: (query: string, page: number = 1) =>
            `search:query:${encodeURIComponent(query)}:page:${page}`,
        autocomplete: (query: string) =>
            `search:autocomplete:${encodeURIComponent(query)}`,
    },

    // Stats caches
    stats: {
        global: () => 'stats:global',
        trending: () => 'stats:trending',
        popular: () => 'stats:popular',
    },
} as const;

/**
 * Cache TTL (Time To Live) in seconds
 */
export const CacheTTL = {
    // Short-lived (5 minutes)
    SHORT: 300,

    // Medium-lived (15 minutes)
    MEDIUM: 900,

    // Long-lived (1 hour)
    LONG: 3600,

    // Very long-lived (6 hours)
    VERY_LONG: 21600,

    // Daily (24 hours)
    DAILY: 86400,

    // Custom TTLs for specific use cases
    homepage: {
        trending: 300,        // 5 minutes
        topArtists: 3600,     // 1 hour
        topMovies: 3600,      // 1 hour
        topContributors: 3600, // 1 hour
        recentRingtones: 300, // 5 minutes
    },

    ringtone: {
        details: 3600,        // 1 hour
        related: 1800,        // 30 minutes
        stats: 300,           // 5 minutes
    },

    movie: {
        details: 3600,        // 1 hour
        ringtones: 900,       // 15 minutes
        stats: 900,           // 15 minutes
    },

    artist: {
        details: 3600,        // 1 hour
        ringtones: 900,       // 15 minutes
        stats: 900,           // 15 minutes
        topLists: 3600,       // 1 hour
    },

    user: {
        profile: 1800,        // 30 minutes
        ringtones: 300,       // 5 minutes
        stats: 300,           // 5 minutes
        gamification: 600,    // 10 minutes
    },

    search: {
        query: 1800,          // 30 minutes
        autocomplete: 3600,   // 1 hour
    },

    stats: {
        global: 900,          // 15 minutes
        trending: 300,        // 5 minutes
        popular: 900,         // 15 minutes
    },
} as const;

/**
 * Cache tags for group invalidation
 */
export const CacheTags = {
    HOMEPAGE: 'homepage',
    RINGTONES: 'ringtones',
    MOVIES: 'movies',
    ARTISTS: 'artists',
    USERS: 'users',
    SEARCH: 'search',
    STATS: 'stats',
} as const;

/**
 * Get all cache keys matching a pattern
 * Useful for bulk invalidation
 */
export function getCachePattern(pattern: string): string {
    return `${pattern}*`;
}

/**
 * Generate cache key with prefix
 */
export function generateCacheKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
}
