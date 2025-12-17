import { createBrowserClient } from '@supabase/ssr';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (query.length < 2) {
        return Response.json([]);
    }

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get unique artists from singers and music_director fields
    const { data } = await supabase
        .from('ringtones')
        .select('singers, music_director')
        .eq('status', 'approved');

    // Extract and deduplicate artist names
    const artistSet = new Set<string>();
    data?.forEach((row: any) => {
        if (row.singers) {
            row.singers.split(',').forEach((s: string) => {
                const name = s.trim();
                if (name) artistSet.add(name);
            });
        }
        if (row.music_director) {
            row.music_director.split(',').forEach((m: string) => {
                const name = m.trim();
                if (name) artistSet.add(name);
            });
        }
    });

    // Filter by query and return matches
    const matches = Array.from(artistSet)
        .filter(name => name.toLowerCase().includes(query.toLowerCase()))
        .sort()
        .slice(0, 10);

    return Response.json(matches);
}
