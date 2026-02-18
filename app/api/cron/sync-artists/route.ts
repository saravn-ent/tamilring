
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY!;
const BASE_URL = 'https://api.themoviedb.org/3';

// Initialize Supabase Admin Client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TMDB_SEARCH_ALIASES: Record<string, string> = {
    "Vijay": "Joseph Vijay",
    "Vikram": "Chiyaan Vikram",
    "Suriya": "Suriya Sivakumar",
    "Ilaiyaraaja": "Ilaiyaraaja",
    "Ilayaraja": "Ilaiyaraaja",
    "A.R. Rahman": "A. R. Rahman",
    "AR Rahman": "A. R. Rahman",
};

async function searchPerson(query: string) {
    if (!query) return null;
    const queryToUse = TMDB_SEARCH_ALIASES[query] ?? query;
    try {
        const searchUrl = `${BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(queryToUse)}&language=en-US&page=1&include_adult=false`;
        const res = await fetch(searchUrl);
        if (!res.ok) return null;
        const data = await res.json();
        return data.results?.[0] || null;
    } catch {
        return null;
    }
}

interface RingtoneData {
    singers: string | null;
    music_director: string | null;
    movie_director: string | null;
    cast_members: string | null;
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        // 1. Fetch some latest ringtones to extract artist names
        const { data, error: ringtoneError } = await supabase
            .from('ringtones')
            .select('singers, music_director, movie_director, cast_members')
            .order('created_at', { ascending: false })
            .limit(50);

        if (ringtoneError) throw ringtoneError;
        
        const ringtones = data as RingtoneData[];

        const artistNames = new Set<string>();
        ringtones.forEach((r) => {
            const parseList = (str: string | null) => {
                if (!str) return [];
                return str.split(/[,&]|\band\b/i).map(s => s.trim()).filter(Boolean);
            };

            parseList(r.singers).forEach(name => artistNames.add(name));
            parseList(r.music_director).forEach(name => artistNames.add(name));
            parseList(r.movie_director).forEach(name => artistNames.add(name));
            parseList(r.cast_members).forEach(name => artistNames.add(name));
        });

        // 2. Identify which names need syncing (we check artist_images table)
        const candidates = Array.from(artistNames).slice(0, 10); // Process small batches per run
        const results = [];
        let successCount = 0;

        for (const name of candidates) {
            // Check if already in DB
            const { data: existing } = await supabase
                .from('artist_images')
                .select('artist_name')
                .eq('artist_name', name)
                .single();

            if (existing) continue;

            const person = await searchPerson(name);
            if (person && person.profile_path) {
                const imageUrl = `https://image.tmdb.org/t/p/w185${person.profile_path}`;
                
                const { error: upsertError } = await supabase
                    .from('artist_images')
                    .upsert({
                        artist_name: name,
                        image_url: imageUrl
                    }, { onConflict: 'artist_name' });

                if (!upsertError) {
                    successCount++;
                    results.push({ name, status: 'synced' });
                } else {
                    results.push({ name, status: 'error', message: upsertError.message });
                }
            } else {
                results.push({ name, status: 'no_match' });
            }
            
            // Minimal delay between external calls
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        return NextResponse.json({
            success: true,
            processed: candidates.length,
            synced: successCount,
            results
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Artist Sync Cron Error:', errorMessage);
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
