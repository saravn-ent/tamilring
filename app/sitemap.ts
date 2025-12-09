
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

    // 2. Static Routes
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

    return [...staticRoutes, ...ringtoneEntries];
}
