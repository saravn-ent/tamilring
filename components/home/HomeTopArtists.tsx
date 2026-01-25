import React from 'react';
import SectionHeader from '@/components/SectionHeader';
import HeroCard from '@/components/HeroCard';
import { supabase } from '@/lib/supabaseClient';
import { unstable_cache } from 'next/cache';
import { searchPerson, getImageUrl } from '@/lib/tmdb';

// Reusing the data fetching logic from the original page.tsx
const getTopArtists = unstable_cache(
    async () => {
        // 1. Fetch Aggregated Artist Stats from Database RPC
        const { data: allPeople, error } = await supabase.rpc('get_all_people_stats');

        if (error || !allPeople) {
            console.error('Error fetching artist stats:', error);
            return { topSingers: [], topMusicDirectors: [], topMovieDirectors: [], topActors: [] };
        }

        // Helper to fetch Person details (Sequential to avoid Rate Limits)
        const cleanName = (n: string) => n.replace(/\(.*?\)/g, '').trim();
        const enrichArtistsSequential = async (list: any[]) => {
            const results = [];
            for (const stats of list) {
                const searchQuery = cleanName(stats.name);
                const person = await searchPerson(searchQuery);
                results.push({
                    name: person?.name || searchQuery,
                    likes: Number(stats.total_likes),
                    count: Number(stats.total_count),
                    movieCount: Number(stats.total_movies),
                    image: person?.profile_path ? getImageUrl(person.profile_path, 'w185') : null
                });
                // Small delay to be nice to TMDB
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return results;
        };

        // 2. Filter by Roles & Slice Top
        const topMDsList = allPeople.filter((p: any) => p.is_md).slice(0, 10);
        const topDirsList = allPeople.filter((p: any) => p.is_dir).slice(0, 10);
        const topActorsList = allPeople.filter((p: any) => p.is_top_actor).slice(0, 10);

        const excludeNormalized = new Set([
            ...topMDsList.map((p: any) => p.normalized_name),
            ...topDirsList.map((p: any) => p.normalized_name),
            ...topActorsList.map((p: any) => p.normalized_name)
        ]);

        const topSingersList = allPeople
            .filter((p: any) => p.is_singer && !excludeNormalized.has(p.normalized_name))
            .slice(0, 12); // A bit more for singers

        // 3. Enrich with TMDB Data Parallelly across chunks but sequential per category
        const [topMusicDirectors, topMovieDirectors, topActors, topSingers] = await Promise.all([
            enrichArtistsSequential(topMDsList),
            enrichArtistsSequential(topDirsList),
            enrichArtistsSequential(topActorsList),
            enrichArtistsSequential(topSingersList)
        ]);

        return { topSingers, topMusicDirectors, topMovieDirectors, topActors };
    },
    ['top-artists-home-v16'], // Bump version
    { revalidate: 3600, tags: ['homepage-artists'] }
);

export default async function HomeTopArtists() {
    const { topSingers, topMusicDirectors, topMovieDirectors, topActors } = await getTopArtists();

    return (
        <>
            {/* Top Singers (The Voices You Love) */}
            {topSingers.length > 0 && (
                <div className="mb-10">
                    <div className="px-4">
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
                                subtitle={`${singer.count} rings`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Top Actors */}
            {topActors && topActors.length > 0 && (
                <div className="mb-10">
                    <div className="px-4">
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
                                subtitle={`${actor.movieCount} movies`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Music Directors */}
            {topMusicDirectors.length > 0 && (
                <div className="mb-10">
                    <div className="px-4">
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
                                subtitle={`${md.count} rings`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Movie Directors */}
            {topMovieDirectors.length > 0 && (
                <div className="mb-10">
                    <div className="px-4">
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
                                subtitle={`${md.count} rings`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
