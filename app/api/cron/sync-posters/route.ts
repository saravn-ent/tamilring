

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Reusing constants from script
const DEITY_IMAGES: Record<string, string> = {
    'Murugan': 'https://images.unsplash.com/photo-1604608672516-f1b1f1c0b4e1?w=600',
    'Siva': 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600',
    'Shiva': 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600',
    'Ganesha': 'https://images.unsplash.com/photo-1597262975002-c5c3b14bbd62?w=600',
    'Vinayagar': 'https://images.unsplash.com/photo-1597262975002-c5c3b14bbd62?w=600',
    'Krishna': 'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=600',
    'Vishnu': 'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=600',
    'Lakshmi': 'https://images.unsplash.com/photo-1604608672516-f1b1f1c0b4e1?w=600',
    'Saraswati': 'https://images.unsplash.com/photo-1604608672516-f1b1f1c0b4e1?w=600',
    'Durga': 'https://images.unsplash.com/photo-1604608672516-f1b1f1c0b4e1?w=600',
    'Kali': 'https://images.unsplash.com/photo-1604608672516-f1b1f1c0b4e1?w=600',
    'Hanuman': 'https://images.unsplash.com/photo-1604608672516-f1b1f1c0b4e1?w=600',
    'Rama': 'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=600',
    'Sai': 'https://images.unsplash.com/photo-1604608672516-f1b1f1c0b4e1?w=600',
    'Ayyappan': 'https://images.unsplash.com/photo-1604608672516-f1b1f1c0b4e1?w=600',
    'Perumal': 'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=600'
};

const CATEGORY_PLACEHOLDERS: Record<string, string> = {
    'devotional': 'https://images.unsplash.com/photo-1604608672516-f1b1f1c0b4e1?w=600',
    'movie': 'https://images.unsplash.com/photo-1574267432644-f610a5e0d4c5?w=600',
    'album': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600',
    'default': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600'
};

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY!;
const BASE_URL = 'https://api.themoviedb.org/3';

// Initialize Supabase Admin Client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Ringtone {
    id: string;
    title: string;
    movie_name: string;
    tags: string[] | null;
    poster_url: string | null;
}

interface TMDBSearchResult {
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    title: string;
}

interface ITunesSearchResult {
    artworkUrl100: string;
    trackName: string;
}

interface SyncResult {
    success: boolean;
    method: 'tmdb' | 'itunes' | 'deity' | 'placeholder';
}

async function searchMovies(query: string): Promise<TMDBSearchResult[]> {
    if (!query) return [];
    try {
        const res = await fetch(`${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.results || [];
    } catch {
        return [];
    }
}

async function searchITunes(query: string): Promise<ITunesSearchResult[]> {
    if (!query) return [];
    try {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=5`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.results || [];
    } catch {
        return [];
    }
}

function getDeityImage(movieName: string) {
    const lowerMovieName = movieName.toLowerCase();
    for (const [deity, imageUrl] of Object.entries(DEITY_IMAGES)) {
        if (lowerMovieName.includes(deity.toLowerCase())) {
            return imageUrl;
        }
    }
    return null;
}

function getCategoryPlaceholder(ringtone: Ringtone) {
    if (ringtone.tags && ringtone.tags.includes('Devotional')) {
        return CATEGORY_PLACEHOLDERS.devotional;
    }
    return CATEGORY_PLACEHOLDERS.movie;
}

async function updatePoster(ringtoneId: string, posterUrl: string, backdropUrl: string | null, year: string | null) {
    const updateData: { poster_url: string; backdrop_url?: string; movie_year?: string } = { poster_url: posterUrl };
    if (backdropUrl) updateData.backdrop_url = backdropUrl;
    if (year) updateData.movie_year = year;

    const { error } = await supabase
        .from('ringtones')
        .update(updateData)
        .eq('id', ringtoneId);

    if (error) {
        throw error;
    }
}

async function fixPosterForRingtone(ringtone: Ringtone): Promise<SyncResult> {
    const movieName = ringtone.movie_name;
    
    if (!movieName || movieName === 'F1' || movieName === 'Other' || movieName === 'Bomb') {
        const placeholder = getCategoryPlaceholder(ringtone);
        await updatePoster(ringtone.id, placeholder, null, null);
        return { success: true, method: 'placeholder' };
    }

    if (ringtone.tags && ringtone.tags.includes('Devotional')) {
        const deityImage = getDeityImage(movieName);
        if (deityImage) {
            await updatePoster(ringtone.id, deityImage, null, null);
            return { success: true, method: 'deity' };
        }
    }

    const tmdbResults = await searchMovies(movieName);
    if (tmdbResults.length > 0) {
        const bestMatch = tmdbResults.slice(0, 3).find((m) => m.poster_path);
        
        if (bestMatch?.poster_path) {
            const posterUrl = `https://image.tmdb.org/t/p/w342${bestMatch.poster_path}`;
            const backdropUrl = bestMatch.backdrop_path ? `https://image.tmdb.org/t/p/w780${bestMatch.backdrop_path}` : null;
            const year = bestMatch.release_date ? bestMatch.release_date.split('-')[0] : null;
            
            await updatePoster(ringtone.id, posterUrl, backdropUrl, year);
            return { success: true, method: 'tmdb' };
        }
    }

    const itunesResults = await searchITunes(movieName);
    if (itunesResults.length > 0) {
        const best = itunesResults[0];
        if (best.artworkUrl100) {
            const posterUrl = best.artworkUrl100.replace(/\/\d+x\d+bb/, '/600x600bb');
            await updatePoster(ringtone.id, posterUrl, null, null);
            return { success: true, method: 'itunes' };
        }
    }

    const placeholder = getCategoryPlaceholder(ringtone);
    await updatePoster(ringtone.id, placeholder, null, null);
    return { success: true, method: 'placeholder' };
}

export const dynamic = 'force-dynamic'; // Ensure no caching

export async function GET(req: NextRequest) {
    // Optional: Add authorization check
    const authHeader = req.headers.get('authorization');
    // Check if CRON_SECRET is set and matches, but allow explicit disabling via empty var (not recommended)
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Just return unauthorized immediately if secret is set and incorrect
         return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        // Fetch up to 20 ringtones with missing posters
        // Wrap placeholders in quotes for Supabase filter
        const placeholders = Object.values(CATEGORY_PLACEHOLDERS).map(p => `"${p}"`).join(',');
        
        const { data, error } = await supabase
            .from('ringtones')
            .select('id, title, movie_name, tags, poster_url')
            .or(`poster_url.is.null,poster_url.in.(${placeholders})`)
            .eq('status', 'approved')
            .limit(20);

        if (error) throw error;
        
        const ringtones = data as Ringtone[];

        if (!ringtones || ringtones.length === 0) {
            return NextResponse.json({ message: 'No missing posters found' });
        }

        const stats = {
            total: ringtones.length,
            tmdb: 0,
            itunes: 0,
            deity: 0,
            placeholder: 0,
            failed: 0
        };
        const results = [];

        for (const ringtone of ringtones) {
            try {
                const result = await fixPosterForRingtone(ringtone);
                if (result.success) {
                    stats[result.method]++;
                    results.push({ id: ringtone.id, status: 'fixed', method: result.method });
                }
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                console.error(`Error processing ${ringtone.id}:`, errorMessage);
                stats.failed++;
                results.push({ id: ringtone.id, status: 'failed', error: errorMessage });
            }
        }

        return NextResponse.json({ 
            success: true, 
            stats,
            results 
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Cron Sync Error:', errorMessage);
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}
