import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { ALL_COLLECTION_SLUGS } from '@/lib/collections';

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
            url: `${SITE_URL}/categories`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/recent`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/directory`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        // Tools & Studio
        {
            url: `${SITE_URL}/tools`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${SITE_URL}/tools/cutter`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${SITE_URL}/tools/vocal-remover`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${SITE_URL}/tools/karaoke`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${SITE_URL}/tools/name-ringtone`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        // Legal / Info
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
        },
        {
            url: `${SITE_URL}/contact`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.4,
        },
        // High-value SEO landing pages
        {
            url: `${SITE_URL}/iphone-ringtone-guide`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        // Programmatic SEO collection pages (/ringtones/[slug])
        ...ALL_COLLECTION_SLUGS.map(slug => ({
            url: `${SITE_URL}/ringtones/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.85,
        })),
    );

    try {
        // 2. Fetch Ringtones (limit to 10000 for sitemap size)
        console.log('[Sitemap] Fetching ringtones...');
        const { data: ringtones } = await supabase
            .from('ringtones')
            .select('slug, created_at')
            .eq('status', 'approved')
            .order('created_at', { ascending: false })
            .limit(10000);

        if (ringtones) {
            ringtones.forEach((ring) => {
                sitemap.push({
                    url: `${SITE_URL}/ringtone/${ring.slug}`,
                    lastModified: new Date(ring.created_at),
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

        // 5. Fetch Devotional Deities (NEW)
        console.log('[Sitemap] Fetching deities...');
        const { data: deityData } = await supabase
            .from('ringtones')
            .select('movie_name, created_at')
            .eq('status', 'approved')
            .contains('tags', ['Devotional'])
            .not('movie_name', 'is', null)
            .order('created_at', { ascending: false });

        if (deityData) {
            const uniqueDeities = new Map<string, string>();
            deityData.forEach(d => {
                if (d.movie_name && !uniqueDeities.has(d.movie_name)) {
                    uniqueDeities.set(d.movie_name, d.created_at);
                }
            });

            uniqueDeities.forEach((date, name) => {
                sitemap.push({
                    url: `${SITE_URL}/devotional/${encodeURIComponent(name)}`,
                    lastModified: new Date(date),
                    changeFrequency: 'weekly',
                    priority: 0.8,
                });
            });
            console.log(`[Sitemap] Added ${uniqueDeities.size} deities`);
        }

        // 6. Fetch Moods (NEW)
        console.log('[Sitemap] Fetching moods...');
        const { data: moodData } = await supabase
            .from('ringtones')
            .select('mood, created_at')
            .eq('status', 'approved')
            .not('mood', 'is', null)
            .order('created_at', { ascending: false });

        if (moodData) {
            const uniqueMoods = new Map<string, string>();
            moodData.forEach(m => {
                if (m.mood && !uniqueMoods.has(m.mood)) {
                    uniqueMoods.set(m.mood, m.created_at);
                }
            });

            uniqueMoods.forEach((date, mood) => {
                sitemap.push({
                    url: `${SITE_URL}/mood/${encodeURIComponent(mood)}`,
                    lastModified: new Date(date),
                    changeFrequency: 'weekly',
                    priority: 0.7,
                });
            });
            console.log(`[Sitemap] Added ${uniqueMoods.size} moods`);
        }

        // 7. Fetch Actors (NEW) — via cast_members column
        console.log('[Sitemap] Fetching actors...');
        const { data: actorData } = await supabase
            .from('ringtones')
            .select('cast_members, created_at')
            .eq('status', 'approved')
            .not('cast_members', 'is', null)
            .limit(2000);

        if (actorData) {
            const uniqueActors = new Map<string, string>();
            actorData.forEach(row => {
                if (row.cast_members) {
                    row.cast_members.split(',').forEach((actor: string) => {
                        const name = actor.trim();
                        if (name && !uniqueActors.has(name)) {
                            uniqueActors.set(name, row.created_at);
                        }
                    });
                }
            });

            uniqueActors.forEach((date, name) => {
                sitemap.push({
                    url: `${SITE_URL}/actor/${encodeURIComponent(name)}`,
                    lastModified: new Date(date),
                    changeFrequency: 'monthly',
                    priority: 0.5,
                });
            });
            console.log(`[Sitemap] Added ${uniqueActors.size} actors`);
        }

        console.log(`[Sitemap] Generated ${sitemap.length} total URLs`);
    } catch (error) {
        console.error('[Sitemap] Error generating sitemap:', error);
    }

    return sitemap;
}
