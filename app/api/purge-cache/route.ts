
import { NextRequest, NextResponse } from 'next/server';
import { invalidateRingtoneCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const slug = req.nextUrl.searchParams.get('slug');
    if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });

    try {
        await invalidateRingtoneCache('manual', slug);
        return NextResponse.json({ success: true, message: `Cache purged for ${slug}` });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
