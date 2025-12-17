import { NextRequest, NextResponse } from 'next/server';
import { ringtoneService } from '@/lib/services/ringtone.service';
import { apiHandler } from '@/lib/api-handler';

import { ratelimit } from '@/lib/rate-limit';

// GET /api/ringtones?limit=10
export async function GET(request: NextRequest) {
    // 1. Rate Limit - Get IP from headers (Next.js 15+ doesn't have request.ip)
    const ip = request.headers.get('x-forwarded-for') ??
        request.headers.get('x-real-ip') ??
        'unknown';
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);

    if (!success) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': limit.toString(),
                    'X-RateLimit-Remaining': remaining.toString(),
                    'X-RateLimit-Reset': new Date(reset).toISOString(),
                }
            }
        );
    }

    return apiHandler(async () => {
        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '10');

        // Check cache/db via service
        const data = await ringtoneService.getTrendingRingtones(limit);

        return NextResponse.json(data);
    });
}
