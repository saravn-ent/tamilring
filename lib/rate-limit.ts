import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// For development/testing without Upstash
class InMemoryRateLimiter {
    private requests: Map<string, number[]> = new Map()

    async limit(identifier: string) {
        const now = Date.now()
        const windowMs = 10000 // 10 seconds
        const maxRequests = 10

        const userRequests = this.requests.get(identifier) || []
        const recentRequests = userRequests.filter(time => now - time < windowMs)

        if (recentRequests.length >= maxRequests) {
            return { success: false, limit: maxRequests, remaining: 0, reset: now + windowMs }
        }

        recentRequests.push(now)
        this.requests.set(identifier, recentRequests)

        return {
            success: true,
            limit: maxRequests,
            remaining: maxRequests - recentRequests.length,
            reset: now + windowMs
        }
    }
}

// Use Upstash in production, in-memory for dev
export const ratelimit = process.env.UPSTASH_REDIS_REST_URL
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(10, '10 s'),
        analytics: true,
    })
    : new InMemoryRateLimiter()
