import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create a new ratelimiter, that allows 10 requests per 10 seconds
export const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(20, '10 s'), // Increased to 20 for development sanity
    analytics: true,
    prefix: '@upstash/ratelimit',
});

// Helper for API usage
export async function checkRateLimit(identifier: string) {
    const { success, limit, reset, remaining } = await ratelimit.limit(identifier);
    return { success, limit, reset, remaining };
}
