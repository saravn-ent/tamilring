import React from 'react';
import SectionHeader from '@/components/SectionHeader';
import NewReleasesList from './NewReleasesList';
import { supabase } from '@/lib/supabaseClient';
import { unstable_cache } from 'next/cache';
import Link from 'next/link';

interface NewRelease {
    movie_name: string;
    poster_url: string;
    movie_year: string;
    ringtone_count: number;
}

const getNewReleases = unstable_cache(
    async (lang: string = 'tamil'): Promise<NewRelease[]> => {
        // Fetch recently added ringtones with posters
        let query = supabase
            .from('ringtones')
            .select('movie_name, poster_url, movie_year, created_at')
            .eq('status', 'approved')
            .not('poster_url', 'is', null)
            .neq('poster_url', '');

        if (lang === 'tamil') {
            query = query.or(`language.eq.${lang},language.is.null`);
        } else {
            query = query.eq('language', lang);
        }

        const { data: ringtones } = await query
            .order('created_at', { ascending: false })
            .limit(100);

        if (!ringtones || ringtones.length === 0) return [];

        // Group by movie_name → pick the most recent poster + count
        const movieMap = new Map<string, NewRelease>();

        for (const r of ringtones) {
            if (!r.movie_name) continue;
            if (movieMap.has(r.movie_name)) {
                // Increment count only
                movieMap.get(r.movie_name)!.ringtone_count++;
            } else {
                movieMap.set(r.movie_name, {
                    movie_name: r.movie_name,
                    poster_url: r.poster_url,
                    movie_year: r.movie_year || '',
                    ringtone_count: 1,
                });
            }
        }

        // Return top 10 unique movies (ordered by most-recent first, which is the iteration order from the sorted query)
        return Array.from(movieMap.values()).slice(0, 10);
    },
    ['new-releases-v1'],
    { revalidate: 3600, tags: ['new-releases', 'recent'] }
);

export default async function HomeNewReleases({ lang }: { lang: string }) {
    const releases = await getNewReleases(lang);

    if (!releases || releases.length === 0) return null;

    return (
        <div className="mb-10">
            <div className="px-4 mb-4 flex items-center justify-between">
                <SectionHeader title="New Releases" translationKey="newReleases" />
                <Link
                    href="/recent"
                    className="text-xs font-semibold text-brand-accent hover:underline shrink-0"
                >
                    See all
                </Link>
            </div>
            <NewReleasesList releases={releases} />
        </div>
    );
}
