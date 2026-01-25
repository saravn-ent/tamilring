
import { NextResponse } from 'next/server';

export async function GET() {
    const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const keyLength = process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0;
    return NextResponse.json({
        hasKey,
        keyLength,
        nodeEnv: process.env.NODE_ENV
    });
}
