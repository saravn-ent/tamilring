
import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Fetch Ringtones
    // Limit to 40000 to be safe (max 50k per sitemap)
    const { data: ringtones } = await supabase
        .from('ringtones')
        .select('slug, updated_at')
        .eq('status', 'approved') // Only approved
        .order('created_at', { ascending: false })
        .limit(10000);

    const ringtoneEntries: MetadataRoute.Sitemap = (ringtones || []).map((ring) => ({
        url: `https://tamilring.in/ringtone/${ring.slug}`,
        lastModified: new Date(ring.updated_at || new Date()),
        changeFrequency: 'monthly',
        priority: 0.8,
    }));

    // 2. Fetch Movies for Silo
    const { data: movies } = await supabase
        .from('ringtones')
        .select('movie_name, updated_at')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(5000);

    const uniqueMovies = new Map<string, string>();
    movies?.forEach(m => {
        if (m.movie_name && !uniqueMovies.has(m.movie_name)) {
            uniqueMovies.set(m.movie_name, m.updated_at);
        }
    });

    const movieEntries: MetadataRoute.Sitemap = Array.from(uniqueMovies.entries()).map(([name, date]) => ({
        url: `https://tamilring.in/tamil/movies/${encodeURIComponent(name)}`,
        lastModified: new Date(date || new Date()),
        changeFrequency: 'weekly',
        priority: 0.9,
    }));

    // 3. Fetch Music Directors for Silo
    const { data: musicDirectors } = await supabase
        .from('ringtones')
        .select('music_director, updated_at')
        .eq('status', 'approved')
        .not('music_director', 'is', null)
        .order('created_at', { ascending: false })
        .limit(2000);

    const uniqueMDs = new Map<string, string>();
    musicDirectors?.forEach(m => {
        if (m.music_director) {
            // Split if comma separated? For now assume primary name strict or split first
            const primaryMD = m.music_director.split(',')[0].trim();
            if (primaryMD && !uniqueMDs.has(primaryMD)) {
                uniqueMDs.set(primaryMD, m.updated_at);
            }
        }
    });

    const mdEntries: MetadataRoute.Sitemap = Array.from(uniqueMDs.entries()).map(([name, date]) => ({
        url: `https://tamilring.in/tamil/music-directors/${encodeURIComponent(name)}`,
        lastModified: new Date(date || new Date()),
        changeFrequency: 'weekly',
        priority: 0.9,
    }));

    // 4. Static Routes
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: 'https://tamilring.in',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: 'https://tamilring.in/privacy',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: 'https://tamilring.in/legal/terms',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: 'https://tamilring.in/legal/dmca',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];

    return [...staticRoutes, ...movieEntries, ...mdEntries, ...ringtoneEntries];
}
