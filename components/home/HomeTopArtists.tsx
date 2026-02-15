import React from 'react';
import SectionHeader from '@/components/SectionHeader';
import HeroCard from '@/components/HeroCard';
import { supabase } from '@/lib/supabaseClient';
import { unstable_cache } from 'next/cache';
import { searchPerson, getImageUrl } from '@/lib/tmdb';
import { TOP_ACTORS_BY_LANGUAGE, TOP_SINGERS_BY_LANGUAGE, TOP_MUSIC_DIRECTORS_BY_LANGUAGE, MOODS, INSTRUMENTS } from '@/lib/constants';

const getTopArtists = unstable_cache(
    async (lang: string = 'tamil') => {
        const regionalActors = TOP_ACTORS_BY_LANGUAGE[lang] || [];
        const regionalSingers = TOP_SINGERS_BY_LANGUAGE[lang] || [];
        const regionalMDs = TOP_MUSIC_DIRECTORS_BY_LANGUAGE[lang] || [];
        // 1. Fetch data filtered by language
        let query = supabase
            .from('ringtones')
            .select('*') // Select all to avoid crashing if specific columns miss in local DB
            .eq('status', 'approved');

        if (lang === 'tamil') {
            query = query.or('language.eq.tamil,language.is.null');
        } else {
            query = query.eq('language', lang);
        }

        let { data: ringtones, error } = await query;

        if (error) {
            console.error('Error fetching top artists:', error);
            return { topSingers: [], topMusicDirectors: [], topMovieDirectors: [], topActors: [] };
        }

        // Fallback: If no results for requested lang, try tamil
        if ((!ringtones || ringtones.length === 0) && lang !== 'tamil') {
            const { data: fallback } = await supabase
                .from('ringtones')
                .select('music_director, singers, tags, cast_members, movie_director')
                .eq('status', 'approved')
                .or('language.eq.tamil,language.is.null');
            ringtones = fallback;
        }

        if (!ringtones) return { topSingers: [], topMusicDirectors: [], topMovieDirectors: [], topActors: [] };

        const singerCounts: Record<string, number> = {};
        const mdCounts: Record<string, number> = {};
        const actorCounts: Record<string, number> = {};
        const directorCounts: Record<string, number> = {};

        ringtones.forEach(r => {
            // Music Directors
            if (r.music_director) {
                const mds = r.music_director.split(/,|&|feat\.|ft\./i).map((n: string) => n.trim()).filter(Boolean);
                mds.forEach((name: string) => {
                    if (name.length > 2) mdCounts[name] = (mdCounts[name] || 0) + 1;
                });
            }

            // Singers
            if (r.singers) {
                const singers = r.singers.split(/,|&|feat\.|ft\./i).map((n: string) => n.trim()).filter(Boolean);
                singers.forEach((name: string) => {
                    const clean = name.replace(/\(.*\)/g, '').trim();
                    if (clean.length > 2) singerCounts[clean] = (singerCounts[clean] || 0) + 1;
                });
            }

            // Castmembers
            if (r.cast_members) {
                const cast = r.cast_members.split(/,|&|feat\.|ft\./i).map((n: string) => n.trim()).filter(Boolean);
                cast.forEach((name: string) => {
                    if (name.length > 2) actorCounts[name] = (actorCounts[name] || 0) + 1;
                });
            }

            // Movie Directors
            if (r.movie_director) {
                const dirs = r.movie_director.split(/,|&|feat\.|ft\./i).map((n: string) => n.trim()).filter(Boolean);
                dirs.forEach((name: string) => {
                    if (name.length > 2) directorCounts[name] = (directorCounts[name] || 0) + 1;
                });
            }

            // Cast/Actors - checking tags effectively for now as 'cast' column might be sporadic
            if (r.tags && Array.isArray(r.tags)) {
                r.tags.forEach((tag: string) => {
                    const moodNames = MOODS.map(m => m.toLowerCase());
                    const instrumentNames = INSTRUMENTS.map(i => i.label.toLowerCase());
                    const genericBanned = ['love', 'bgm', 'remix', 'sad', 'funny', 'dialogue', 'movie', 'song', 'female', 'male', 'instrumental', 'vocal', 'mass', 'duet', 'version', 'theme'];

                    const lowerTag = tag.toLowerCase();

                    if (!genericBanned.includes(lowerTag) &&
                        !moodNames.includes(lowerTag) &&
                        !instrumentNames.includes(lowerTag) &&
                        tag.length > 3) {

                        // If we have a curated list for this language, only count those as actors from tags
                        // to avoid genres like 'Vocal', 'Violin' leaking in.
                        if (regionalActors.some(a => a.toLowerCase() === lowerTag)) {
                            actorCounts[tag] = (actorCounts[tag] || 0) + 1;
                        }
                    }
                });
            }
        });

        // specific aggregation for Directors if column exists, else skip
        // (Assuming 'director' column or similar)

        const getTop = (counts: Record<string, number>) => Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15) // Top 15 candidates
            .map(e => e[0]);

        const topSingersList = getTop(singerCounts);
        const topMDsList = getTop(mdCounts);
        const topActorsCandidates = getTop(actorCounts);

        // Helper to enrich
        // For Actors, we strictly check known_for_department on TMDB
        const enrich = async (names: string[], dept?: string) => {
            const results = await Promise.all(names.map(async (name) => {
                const person = await searchPerson(name);

                // If found in TMDB with image
                if (person && person.profile_path) {
                    return {
                        name: person.name || name,
                        image: getImageUrl(person.profile_path, 'w185')
                    };
                }

                // FALLBACK: If not found in TMDB, STILL RETURN IT with a placeholder
                // This ensures the section shows up even if TMDB fails
                return {
                    name: name,
                    image: '' // HeroCard will handle empty image with initials or placeholder
                };
            }));
            return results;
        };

        const [topSingers, topMusicDirectors, topActorsRaw, topMovieDirectors] = await Promise.all([
            enrich(regionalSingers), // STRICTLY USE HARDCODED LIST FOR SINGERS
            enrich(regionalMDs), // STRICTLY USE HARDCODED LIST FOR MUSIC DIRECTORS
            enrich(regionalActors), // STRICTLY USE HARDCODED LIST FOR ACTORS
            enrich(getTop(directorCounts)) // Relaxed for Directors
        ]);



        return {
            topSingers: topSingers.slice(0, 8),
            topMusicDirectors: topMusicDirectors.slice(0, 8),
            topMovieDirectors: topMovieDirectors.slice(0, 8),
            topActors: topActorsRaw.slice(0, 8)
        };
    },
    ['home-top-artists-dynamic-v8'], // Updated version
    { revalidate: 3600, tags: ['homepage-artists'] }
);

export async function HomeSingers({ lang }: { lang: string }) {
    const { topSingers } = await getTopArtists(lang);
    if (!topSingers || topSingers.length === 0) return null;

    return (
        <div className="mb-10">
            <div className="px-4 text-center mb-6">
                <SectionHeader title="The Voices You Love" />
            </div>
            <div className="flex overflow-x-auto px-4 pb-8 scrollbar-hide snap-x pt-2 pl-6 md:grid md:grid-cols-4 lg:grid-cols-8 md:gap-6 md:px-0 md:pl-0 md:overflow-visible">
                {topSingers.map((singer, idx) => (
                    <HeroCard
                        key={idx}
                        index={idx}
                        name={singer.name}
                        image={singer.image}
                        href={`/artist/${encodeURIComponent(singer.name)}`}
                        priority={idx < 4}
                        className="md:w-full md:h-auto md:aspect-2/3"
                    />
                ))}
            </div>
        </div>
    );
}

export async function HomeMusicDirectors({ lang }: { lang: string }) {
    const { topMusicDirectors } = await getTopArtists(lang);
    if (!topMusicDirectors || topMusicDirectors.length === 0) return null;

    return (
        <div className="mb-10">
            <div className="px-4 text-center mb-6">
                <SectionHeader title="Music Directors" />
            </div>
            <div className="flex overflow-x-auto px-4 pb-8 scrollbar-hide snap-x pt-2 pl-6 md:grid md:grid-cols-4 lg:grid-cols-8 md:gap-6 md:px-0 md:pl-0 md:overflow-visible">
                {topMusicDirectors.map((md, idx) => (
                    <HeroCard
                        key={idx}
                        index={idx}
                        name={md.name}
                        image={md.image}
                        href={`/artist/${encodeURIComponent(md.name)}`}
                        priority={false}
                        className="md:w-full md:h-auto md:aspect-2/3"
                    />
                ))}
            </div>
        </div>
    );
}

export async function HomeActors({ lang }: { lang: string }) {
    const { topActors } = await getTopArtists(lang);
    if (!topActors || topActors.length === 0) return null;

    return (
        <div className="mb-10">
            <div className="px-4 text-center mb-6">
                <SectionHeader title="Top Actors" />
            </div>
            <div className="flex overflow-x-auto px-4 pb-8 scrollbar-hide snap-x pt-2 pl-6 md:grid md:grid-cols-4 lg:grid-cols-8 md:gap-6 md:px-0 md:pl-0 md:overflow-visible">
                {topActors.map((actor, idx) => (
                    <HeroCard
                        key={idx}
                        index={idx}
                        name={actor.name}
                        image={actor.image}
                        href={`/artist/${encodeURIComponent(actor.name)}`}
                        priority={false}
                        className="md:w-full md:h-auto md:aspect-2/3"
                    />
                ))}
            </div>
        </div>
    );
}

export async function HomeMovieDirectors({ lang }: { lang: string }) {
    const { topMovieDirectors } = await getTopArtists(lang);
    if (!topMovieDirectors || topMovieDirectors.length === 0) return null;

    return (
        <div className="mb-10">
            <div className="px-4 text-center mb-6">
                <SectionHeader title="Movie Directors" />
            </div>
            <div className="flex overflow-x-auto px-4 pb-8 scrollbar-hide snap-x pt-2 pl-6 md:grid md:grid-cols-4 lg:grid-cols-8 md:gap-6 md:px-0 md:pl-0 md:overflow-visible">
                {topMovieDirectors.map((director, idx) => (
                    <HeroCard
                        key={idx}
                        index={idx}
                        name={director.name}
                        image={director.image}
                        href={`/artist/${encodeURIComponent(director.name)}`}
                        priority={false}
                        className="md:w-full md:h-auto md:aspect-2/3"
                    />
                ))}
            </div>
        </div>
    );
}
