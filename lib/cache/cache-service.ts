import { cache as redisClient } from './redis';
import { CacheTTL } from './cache-keys';

/**
 * Cache service with advanced features
 * - Get/Set/Delete operations
 * - Batch operations
 * - Cache warming
 * - Graceful fallbacks
 */

export interface CacheOptions {
    ttl?: number;
    tags?: string[];
}

export interface CacheStats {
    hits: number;
    misses: number;
    errors: number;
}

// In-memory stats tracking
const stats: CacheStats = {
    hits: 0,
    misses: 0,
    errors: 0,
};

/**
 * Get value from cache
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
    if (!redisClient) {
        stats.misses++;
        return null;
    }

    try {
        const value = await redisClient.get<T>(key);

        if (value !== null) {
            stats.hits++;
            console.log(`[Cache HIT] ${key}`);
        } else {
            stats.misses++;
            console.log(`[Cache MISS] ${key}`);
        }

        return value;
    } catch (error) {
        stats.errors++;
        console.error(`[Cache Error] Get failed for ${key}:`, error);
        return null;
    }
}

/**
 * Set value in cache
 */
export async function cacheSet<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
): Promise<boolean> {
    if (!redisClient) {
        return false;
    }

    const ttl = options.ttl || CacheTTL.MEDIUM;

    try {
        await redisClient.set(key, value, { ex: ttl });
        console.log(`[Cache SET] ${key} (TTL: ${ttl}s)`);
        return true;
    } catch (error) {
        stats.errors++;
        console.error(`[Cache Error] Set failed for ${key}:`, error);
        return false;
    }
}

/**
 * Delete value from cache
 */
export async function cacheDelete(key: string): Promise<boolean> {
    if (!redisClient) {
        return false;
    }

    try {
        await redisClient.del(key);
        console.log(`[Cache DELETE] ${key}`);
        return true;
    } catch (error) {
        stats.errors++;
        console.error(`[Cache Error] Delete failed for ${key}:`, error);
        return false;
    }
}

/**
 * Delete multiple keys matching a pattern
 */
export async function cacheDeletePattern(pattern: string): Promise<number> {
    if (!redisClient) {
        return 0;
    }

    try {
        // Note: Upstash Redis doesn't support SCAN, so we'll use a different approach
        // For now, we'll track keys manually or use tags
        console.log(`[Cache DELETE PATTERN] ${pattern}`);
        // This is a placeholder - implement based on your Redis setup
        return 0;
    } catch (error) {
        stats.errors++;
        console.error(`[Cache Error] Delete pattern failed for ${pattern}:`, error);
        return 0;
    }
}

/**
 * Get or set cache (cache-aside pattern)
 */
export async function cacheGetOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
): Promise<T> {
    // Try to get from cache first
    const cached = await cacheGet<T>(key);

    if (cached !== null) {
        return cached;
    }

    // Cache miss - fetch data
    try {
        const data = await fetcher();

        // Store in cache for next time
        await cacheSet(key, data, options);

        return data;
    } catch (error) {
        console.error(`[Cache Error] Fetcher failed for ${key}:`, error);
        throw error;
    }
}

/**
 * Batch get multiple keys
 */
export async function cacheMGet<T>(keys: string[]): Promise<(T | null)[]> {
    if (!redisClient || keys.length === 0) {
        return keys.map(() => null);
    }

    try {
        const values = await redisClient.mget(...keys) as (T | null)[];

        values.forEach((value, index) => {
            if (value !== null) {
                stats.hits++;
                console.log(`[Cache HIT] ${keys[index]}`);
            } else {
                stats.misses++;
                console.log(`[Cache MISS] ${keys[index]}`);
            }
        });

        return values;
    } catch (error) {
        stats.errors++;
        console.error('[Cache Error] MGet failed:', error);
        return keys.map(() => null);
    }
}

/**
 * Batch set multiple key-value pairs
 */
export async function cacheMSet(
    entries: Array<{ key: string; value: any; ttl?: number }>
): Promise<boolean> {
    if (!redisClient || entries.length === 0) {
        return false;
    }

    try {
        // Set each entry individually with its TTL
        await Promise.all(
            entries.map(({ key, value, ttl }) =>
                cacheSet(key, value, { ttl })
            )
        );

        console.log(`[Cache MSET] Set ${entries.length} keys`);
        return true;
    } catch (error) {
        stats.errors++;
        console.error('[Cache Error] MSet failed:', error);
        return false;
    }
}

/**
 * Check if key exists in cache
 */
export async function cacheExists(key: string): Promise<boolean> {
    if (!redisClient) {
        return false;
    }

    try {
        const exists = await redisClient.exists(key);
        return exists === 1;
    } catch (error) {
        stats.errors++;
        console.error(`[Cache Error] Exists check failed for ${key}:`, error);
        return false;
    }
}

/**
 * Get remaining TTL for a key
 */
export async function cacheTTL(key: string): Promise<number> {
    if (!redisClient) {
        return -1;
    }

    try {
        const ttl = await redisClient.ttl(key);
        return ttl;
    } catch (error) {
        stats.errors++;
        console.error(`[Cache Error] TTL check failed for ${key}:`, error);
        return -1;
    }
}

/**
 * Increment a counter in cache
 */
export async function cacheIncrement(
    key: string,
    amount: number = 1
): Promise<number> {
    if (!redisClient) {
        return 0;
    }

    try {
        const newValue = await redisClient.incrby(key, amount);
        console.log(`[Cache INCR] ${key} by ${amount} = ${newValue}`);
        return newValue;
    } catch (error) {
        stats.errors++;
        console.error(`[Cache Error] Increment failed for ${key}:`, error);
        return 0;
    }
}

/**
 * Decrement a counter in cache
 */
export async function cacheDecrement(
    key: string,
    amount: number = 1
): Promise<number> {
    if (!redisClient) {
        return 0;
    }

    try {
        const newValue = await redisClient.decrby(key, amount);
        console.log(`[Cache DECR] ${key} by ${amount} = ${newValue}`);
        return newValue;
    } catch (error) {
        stats.errors++;
        console.error(`[Cache Error] Decrement failed for ${key}:`, error);
        return 0;
    }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): CacheStats {
    const total = stats.hits + stats.misses;
    const hitRate = total > 0 ? (stats.hits / total) * 100 : 0;

    return {
        ...stats,
        hitRate: parseFloat(hitRate.toFixed(2)),
    } as CacheStats & { hitRate: number };
}

/**
 * Reset cache statistics
 */
export function resetCacheStats(): void {
    stats.hits = 0;
    stats.misses = 0;
    stats.errors = 0;
}

/**
 * Warm cache with data
 * Useful for pre-loading frequently accessed data
 */
export async function warmCache<T>(
    entries: Array<{ key: string; fetcher: () => Promise<T>; ttl?: number }>
): Promise<void> {
    console.log(`[Cache WARM] Warming ${entries.length} cache entries...`);

    const results = await Promise.allSettled(
        entries.map(async ({ key, fetcher, ttl }) => {
            try {
                const data = await fetcher();
                await cacheSet(key, data, { ttl });
                return { key, success: true };
            } catch (error) {
                console.error(`[Cache WARM] Failed to warm ${key}:`, error);
                return { key, success: false };
            }
        })
    );

    const successful = results.filter(
        (r) => r.status === 'fulfilled' && r.value.success
    ).length;

    console.log(`[Cache WARM] Warmed ${successful}/${entries.length} entries`);
}

/**
 * Clear all cache (use with caution!)
 */
export async function clearAllCache(): Promise<boolean> {
    if (!redisClient) {
        return false;
    }

    try {
        await redisClient.flushdb();
        console.log('[Cache FLUSH] All cache cleared');
        resetCacheStats();
        return true;
    } catch (error) {
        stats.errors++;
        console.error('[Cache Error] Flush failed:', error);
        return false;
    }
}

/**
 * Check if Redis is available
 */
export function isCacheAvailable(): boolean {
    return redisClient !== null;
}
