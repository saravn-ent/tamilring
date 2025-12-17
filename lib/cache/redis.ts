import { Redis } from '@upstash/redis';

let redisClient: Redis | null = null;
try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        redisClient = Redis.fromEnv();
    }
} catch (e) {
    console.warn("Redis init failed (lib/cache/redis):", e);
}

export const cache = redisClient;

export async function getCached<T>(key: string): Promise<T | null> {
    if (!cache) return null;
    try {
        return await cache.get(key);
    } catch (e) {
        console.error('Redis Get Error:', e);
        return null;
    }
}

export async function setCached(key: string, value: any, ttlSeconds: number = 300) {
    if (!cache) return;
    try {
        await cache.set(key, value, { ex: ttlSeconds });
    } catch (e) {
        console.error('Redis Set Error:', e);
    }
}
