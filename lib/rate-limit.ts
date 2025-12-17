import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create a new ratelimiter, that allows 10 requests per 10 seconds
let limiter: Ratelimit | null = null;

try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        limiter = new Ratelimit({
            redis: Redis.fromEnv(),
            limiter: Ratelimit.slidingWindow(20, '10 s'),
            analytics: true,
            prefix: '@upstash/ratelimit',
        });
    }
} catch (e) {
    console.warn("Rate limit init failed (lib/rate-limit):", e);
}

export const ratelimit = limiter;

// Helper for API usage
export async function checkRateLimit(identifier: string) {
    if (!ratelimit) {
        return { success: true, limit: 100, reset: 0, remaining: 100 };
    }
    const { success, limit, reset, remaining } = await ratelimit.limit(identifier);
    return { success, limit, reset, remaining };
}
