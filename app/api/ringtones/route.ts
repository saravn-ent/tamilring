import { NextRequest, NextResponse } from 'next/server';
import { ringtoneService } from '@/lib/services/ringtone.service';
import { apiHandler } from '@/lib/api-handler';

// GET /api/ringtones?limit=10
export async function GET(request: NextRequest) {
    return apiHandler(async () => {
        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '10');

        // Check cache/db via service
        const data = await ringtoneService.getTrendingRingtones(limit);

        return NextResponse.json(data);
    });
}
