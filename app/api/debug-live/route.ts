
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'; // Ensure this never caches

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let debugInfo = {
        env: {
            NEXT_PUBLIC_SUPABASE_URL_PRESENT: !!supabaseUrl,
            NEXT_PUBLIC_SUPABASE_ANON_KEY_PRESENT: !!anonKey,
            SUPABASE_SERVICE_ROLE_KEY_PRESENT: !!serviceKey,
            NODE_ENV: process.env.NODE_ENV,
        },
        connection: 'Pending',
        data: null as any,
        error: null as any,
    };

    if (!supabaseUrl || !anonKey) {
        debugInfo.connection = 'Failed: Missing URL or Anon Key';
        return NextResponse.json(debugInfo, { status: 500 });
    }

    try {
        // Try connecting with Service Role if available (preferred for sitemap), else Anon
        const keyToUse = serviceKey || anonKey;
        const supabase = createClient(supabaseUrl, keyToUse);

        const { count, error } = await supabase
            .from('ringtones')
            .select('*', { count: 'exact', head: true });

        if (error) {
            debugInfo.connection = 'Connected but Query Failed';
            debugInfo.error = error;
        } else {
            debugInfo.connection = 'Success';
            debugInfo.data = { count };
        }

    } catch (e: any) {
        debugInfo.connection = 'Exception Thrown';
        debugInfo.error = e.message || 'Unknown error';
    }

    return NextResponse.json(debugInfo);
}
