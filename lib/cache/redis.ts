import { Redis } from '@upstash/redis';

export const cache = Redis.fromEnv();

export async function getCached<T>(key: string): Promise<T | null> {
    try {
        return await cache.get(key);
    } catch (e) {
        console.error('Redis Get Error:', e);
        return null;
    }
}

export async function setCached(key: string, value: any, ttlSeconds: number = 300) {
    try {
        await cache.set(key, value, { ex: ttlSeconds });
    } catch (e) {
        console.error('Redis Set Error:', e);
    }
}
