import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { ALL_COLLECTION_SLUGS } from '@/lib/collections';
import { splitArtists } from '@/lib/utils';
import { MOODS, DEITY_CATEGORIES } from '@/lib/constants';

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
        // Community & Editorial
        {
            url: `${SITE_URL}/requests`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${SITE_URL}/valentines`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
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
        // 2. Fetch Ringtones with pagination to bypass PostgREST 1000-row limit
        console.log('[Sitemap] Fetching ringtones...');
        const ringtones: { slug: string; created_at: string }[] = [];
        const pageSize = 1000;
        let from = 0;
        let hasMore = true;

        while (hasMore) {
            const { data, error } = await supabase
                .from('ringtones')
                .select('slug, created_at')
                .eq('status', 'approved')
                .order('created_at', { ascending: false })
                .range(from, from + pageSize - 1);

            if (error || !data || data.length === 0) {
                break;
            }

            ringtones.push(...data);
            if (data.length < pageSize) {
                hasMore = false;
            } else {
                from += pageSize;
            }
        }

        if (ringtones.length > 0) {
            ringtones.forEach((ring) => {
                if (ring.slug && ring.slug.trim()) {
                    sitemap.push({
                        url: `${SITE_URL}/ringtone/${ring.slug.trim()}`,
                        lastModified: new Date(ring.created_at),
                        changeFrequency: 'weekly',
                        priority: 0.8,
                    });
                }
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
            .order('created_at', { ascending: false });

        if (movieData) {
            const uniqueMovies = new Map<string, string>();
            movieData.forEach(m => {
                const name = m.movie_name?.trim();
                if (name && !uniqueMovies.has(name)) {
                    uniqueMovies.set(name, m.created_at);
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
        // Uses splitArtists from lib/utils to eliminate compound names and filters out single-character junk
        console.log('[Sitemap] Fetching artists...');
        const { data: artistData } = await supabase
            .from('ringtones')
            .select('singers, music_director, movie_director, created_at')
            .eq('status', 'approved');

        if (artistData) {
            const uniqueArtists = new Map<string, string>();

            const addArtist = (name: string, date: string) => {
                const trimmed = name.trim();
                // Filter out empty or single-character placeholders (e.g. "T", "M", "N", "v")
                if (trimmed.length > 1 && !uniqueArtists.has(trimmed)) {
                    uniqueArtists.set(trimmed, date);
                }
            };

            artistData.forEach((row) => {
                if (row.singers) {
                    splitArtists(row.singers).forEach(name => addArtist(name, row.created_at));
                }
                if (row.music_director) {
                    splitArtists(row.music_director).forEach(name => addArtist(name, row.created_at));
                }
                if (row.movie_director) {
                    splitArtists(row.movie_director).forEach(name => addArtist(name, row.created_at));
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

        // 5. Fetch Devotional Deities
        // Validates deity names against DEITY_CATEGORIES to exclude commercial movies tagged with Devotional
        console.log('[Sitemap] Fetching deities...');
        const { data: deityData } = await supabase
            .from('ringtones')
            .select('movie_name, created_at')
            .eq('status', 'approved')
            .contains('tags', ['Devotional'])
            .not('movie_name', 'is', null)
            .order('created_at', { ascending: false });

        if (deityData) {
            const allAllowedDeities = Object.values(DEITY_CATEGORIES).flat();
            const uniqueDeities = new Map<string, string>();

            deityData.forEach(d => {
                const raw = d.movie_name?.trim();
                if (!raw) return;
                const lower = raw.toLowerCase();
                const words = lower.split(/[^a-z0-9]+/).filter((w: string) => w.length > 0);
                const compact = words.join('');

                for (const deity of allAllowedDeities) {
                    const ld = deity.toLowerCase();
                    const ldCompact = ld.replace(/\s+/g, '');
                    if (words.includes(ld) || lower === ld || compact === ldCompact) {
                        if (!uniqueDeities.has(deity)) {
                            uniqueDeities.set(deity, d.created_at);
                        }
                        break;
                    }
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
            console.log(`[Sitemap] Added ${uniqueDeities.size} verified deities`);
        }

        // 6. Fetch Moods
        // Checks all canonical moods defined in MOODS that have approved ringtones
        console.log('[Sitemap] Fetching moods...');
        let moodCount = 0;
        for (const mood of MOODS) {
            const { data: moodRingtones } = await supabase
                .from('ringtones')
                .select('created_at')
                .eq('status', 'approved')
                .contains('tags', [mood])
                .order('created_at', { ascending: false })
                .limit(1);

            if (moodRingtones && moodRingtones.length > 0) {
                sitemap.push({
                    url: `${SITE_URL}/mood/${encodeURIComponent(mood)}`,
                    lastModified: new Date(moodRingtones[0].created_at),
                    changeFrequency: 'weekly',
                    priority: 0.7,
                });
                moodCount++;
            }
        }
        console.log(`[Sitemap] Added ${moodCount} moods`);

        // 7. Fetch Actors via cast_members column
        console.log('[Sitemap] Fetching actors...');
        const { data: actorData } = await supabase
            .from('ringtones')
            .select('cast_members, created_at')
            .eq('status', 'approved')
            .not('cast_members', 'is', null);

        if (actorData) {
            const uniqueActors = new Map<string, string>();
            actorData.forEach(row => {
                if (row.cast_members) {
                    splitArtists(row.cast_members).forEach((actor: string) => {
                        const name = actor.trim();
                        if (name.length > 1 && !uniqueActors.has(name)) {
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
