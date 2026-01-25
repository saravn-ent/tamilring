import React from 'react';
import SectionHeader from '@/components/SectionHeader';
import HeroCard from '@/components/HeroCard';
import { supabase } from '@/lib/supabaseClient';
import { unstable_cache } from 'next/cache';
import { searchPerson, getImageUrl, getPersonMovieCredits } from '@/lib/tmdb';

// Fetch top artists using the SAME logic as individual artist pages
// Fetch top artists using the EXACT SAME logic as individual artist pages
const getTopArtists = unstable_cache(
    async () => {
        // 1. Fetch all stats in 1 fast query
        const { data: allStats } = await supabase.rpc('get_all_people_stats');
        if (!allStats) return { topSingers: [], topMusicDirectors: [], topMovieDirectors: [], topActors: [] };

        // Helper to fetch images in parallel
        const enrichArtists = async (list: any[]) => {
            return Promise.all(list.map(async (stats) => {
                const person = await searchPerson(stats.name);
                return {
                    name: stats.name,
                    image: person?.profile_path ? getImageUrl(person.profile_path, 'w185') : null
                };
            }));
        };

        // 2. Filter top picks
        const topMDsList = allStats.filter((p: any) => p.is_md).slice(0, 8);
        const topDirsList = allStats.filter((p: any) => p.is_dir).slice(0, 8);
        const topActorsList = allStats.filter((p: any) => p.is_actor).slice(0, 8);
        const topSingersList = allStats.filter((p: any) => p.is_singer).slice(0, 8);

        // 3. Enrich images in parallel
        const [topMusicDirectors, topMovieDirectors, topActors, topSingers] = await Promise.all([
            enrichArtists(topMDsList),
            enrichArtists(topDirsList),
            enrichArtists(topActorsList),
            enrichArtists(topSingersList)
        ]);

        return { topSingers, topMusicDirectors, topMovieDirectors, topActors };
    },
    ['top-artists-home-v28'], // Further optimized count
    { revalidate: 3600, tags: ['homepage-artists'] }
);

// Individual components for each role to allow parallel streaming and better skeletons
export async function HomeSingers() {
    const { topSingers } = await getTopArtists();
    if (!topSingers || topSingers.length === 0) return null;

    return (
        <div className="mb-10">
            <div className="px-4 text-center mb-6">
                <SectionHeader title="The Voices You Love" translationKey={"voices" as any} />
            </div>
            <div className="flex overflow-x-auto px-4 pb-8 scrollbar-hide snap-x pt-2 pl-6">
                {topSingers.map((singer, idx) => (
                    <HeroCard
                        key={idx}
                        index={idx}
                        name={singer.name}
                        image={singer.image || ''}
                        href={`/artist/${encodeURIComponent(singer.name)}`}
                        priority={idx < 4}
                    />
                ))}
            </div>
        </div>
    );
}

export async function HomeActors() {
    const { topActors } = await getTopArtists();
    if (!topActors || topActors.length === 0) return null;

    return (
        <div className="mb-10">
            <div className="px-4 text-center mb-6">
                <SectionHeader title="Top Actors" translationKey={"actors" as any} />
            </div>
            <div className="flex overflow-x-auto px-4 pb-8 scrollbar-hide snap-x pt-2 pl-6">
                {topActors.map((actor, idx) => (
                    <HeroCard
                        key={idx}
                        index={idx}
                        name={actor.name}
                        image={actor.image || ''}
                        href={`/artist/${encodeURIComponent(actor.name)}`}
                        priority={false}
                    />
                ))}
            </div>
        </div>
    );
}

export async function HomeMusicDirectors() {
    const { topMusicDirectors } = await getTopArtists();
    if (!topMusicDirectors || topMusicDirectors.length === 0) return null;

    return (
        <div className="mb-10">
            <div className="px-4 text-center mb-6">
                <SectionHeader title="Music Directors" translationKey="musicDirectors" />
            </div>
            <div className="flex overflow-x-auto px-4 pb-8 scrollbar-hide snap-x pt-2 pl-6">
                {topMusicDirectors.map((md, idx) => (
                    <HeroCard
                        key={idx}
                        index={idx}
                        name={md.name}
                        image={md.image || ''}
                        href={`/artist/${encodeURIComponent(md.name)}`}
                        priority={false}
                    />
                ))}
            </div>
        </div>
    );
}

export async function HomeMovieDirectors() {
    const { topMovieDirectors } = await getTopArtists();
    if (!topMovieDirectors || topMovieDirectors.length === 0) return null;

    return (
        <div className="mb-10">
            <div className="px-4 text-center mb-6">
                <SectionHeader title="Movie Directors" translationKey="movieDirectors" />
            </div>
            <div className="flex overflow-x-auto px-4 pb-8 scrollbar-hide snap-x pt-2 pl-6">
                {topMovieDirectors.map((md, idx) => (
                    <HeroCard
                        key={idx}
                        index={idx}
                        name={md.name}
                        image={md.image || ''}
                        href={`/artist/${encodeURIComponent(md.name)}`}
                        priority={false}
                    />
                ))}
            </div>
        </div>
    );
}
