import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tamilring.in';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Use Service Role Key for full access (bypass RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!supabaseUrl || !supabaseKey) {
        console.error('[Sitemap] Missing Supabase credentials');
        return [];
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const sitemap: MetadataRoute.Sitemap = [];

    console.log('[Sitemap] Generating sitemap...');

    // 1. Static Routes (highest priority)
    sitemap.push(
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${SITE_URL}/browse`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/trending`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/upload`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${SITE_URL}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${SITE_URL}/legal/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${SITE_URL}/legal/dmca`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        }
    );

    try {
        // 2. Fetch Ringtones (limit to 10000 for sitemap size)
        console.log('[Sitemap] Fetching ringtones...');
        const { data: ringtones } = await supabase
            .from('ringtones')
            .select('slug, updated_at, created_at')
            .eq('status', 'approved')
            .order('updated_at', { ascending: false })
            .limit(10000);

        if (ringtones) {
            ringtones.forEach((ring) => {
                sitemap.push({
                    url: `${SITE_URL}/ringtone/${ring.slug}`,
                    lastModified: new Date(ring.updated_at || ring.created_at),
                    changeFrequency: 'weekly',
                    priority: 0.8,
                });
            });
            console.log(`[Sitemap] Added ${ringtones.length} ringtones`);
        }

        // 3. Fetch Movies
        console.log('[Sitemap] Fetching movies...');
        const { data: movieData } = await supabase
            .from('ringtones')
            .select('movie_name, created_at')
            .eq('status', 'approved')
            .not('movie_name', 'is', null)
            .order('created_at', { ascending: false })
            .limit(5000);

        if (movieData) {
            const uniqueMovies = new Map<string, string>();
            movieData.forEach(m => {
                if (m.movie_name && !uniqueMovies.has(m.movie_name)) {
                    uniqueMovies.set(m.movie_name, m.created_at);
                }
            });

            uniqueMovies.forEach((date, name) => {
                sitemap.push({
                    url: `${SITE_URL}/movie/${encodeURIComponent(name)}`,
                    lastModified: new Date(date),
                    changeFrequency: 'weekly',
                    priority: 0.7,
                });
            });
            console.log(`[Sitemap] Added ${uniqueMovies.size} movies`);
        }

        // 4. Fetch Artists (singers, music directors, movie directors)
        console.log('[Sitemap] Fetching artists...');
        const { data: artistData } = await supabase
            .from('ringtones')
            .select('singers, music_director, movie_director, created_at')
            .eq('status', 'approved')
            .limit(3000);

        if (artistData) {
            const uniqueArtists = new Map<string, string>();

            artistData.forEach((row) => {
                // Process singers
                if (row.singers) {
                    row.singers.split(',').forEach((singer: string) => {
                        const name = singer.trim();
                        if (name && !uniqueArtists.has(name)) {
                            uniqueArtists.set(name, row.created_at);
                        }
                    });
                }

                // Process music directors
                if (row.music_director) {
                    row.music_director.split(',').forEach((md: string) => {
                        const name = md.trim();
                        if (name && !uniqueArtists.has(name)) {
                            uniqueArtists.set(name, row.created_at);
                        }
                    });
                }

                // Process movie directors
                if (row.movie_director) {
                    row.movie_director.split(',').forEach((dir: string) => {
                        const name = dir.trim();
                        if (name && !uniqueArtists.has(name)) {
                            uniqueArtists.set(name, row.created_at);
                        }
                    });
                }
            });

            uniqueArtists.forEach((date, name) => {
                sitemap.push({
                    url: `${SITE_URL}/artist/${encodeURIComponent(name)}`,
                    lastModified: new Date(date),
                    changeFrequency: 'weekly',
                    priority: 0.6,
                });
            });
            console.log(`[Sitemap] Added ${uniqueArtists.size} artists`);
        }

        console.log(`[Sitemap] Generated ${sitemap.length} total URLs`);
    } catch (error) {
        console.error('[Sitemap] Error generating sitemap:', error);
    }

    return sitemap;
}
