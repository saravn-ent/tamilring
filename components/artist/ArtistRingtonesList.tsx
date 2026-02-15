import React from 'react';
import RingtoneCard from '@/components/RingtoneCard';
import TMDBImage from '@/components/TMDBImage';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { unstable_cache } from 'next/cache';
import { Ringtone } from '@/types';

const getArtistRingtones = unstable_cache(
    async (artistName: string, sort: string = 'recent', additionalMovieNames: string[] = []) => {
        // Query 1: Direct matches on Artist Name (Singers, Directors, Cast, Lyricists)
        let query1 = supabase
            .from('ringtones')
            .select('*')
            .eq('status', 'approved')
            .or(`singers.ilike.%${artistName}%,music_director.ilike.%${artistName}%,movie_director.ilike.%${artistName}%,cast_members.ilike.%${artistName}%,lyricist.ilike.%${artistName}%`);

        // Query 2: Matches on Movie Names (for Actors)
        let query2 = null;
        if (additionalMovieNames.length > 0) {
            query2 = supabase
                .from('ringtones')
                .select('*')
                .eq('status', 'approved')
                .in('movie_name', additionalMovieNames);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const applySort = (q: any) => {
            switch (sort) {
                case 'downloads': return q.order('downloads', { ascending: false });
                case 'likes': return q.order('likes', { ascending: false });
                case 'year_desc': return q.order('movie_year', { ascending: false });
                case 'year_asc': return q.order('movie_year', { ascending: true });
                default: return q.order('created_at', { ascending: false });
            }
        };

        query1 = applySort(query1);
        if (query2) query2 = applySort(query2);

        // Execute queries in parallel
        const [res1, res2] = await Promise.all([
            query1.limit(100),
            query2 ? query2.limit(100) : Promise.resolve({ data: [] })
        ]);

        const data1 = res1.data || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data2: any[] = res2.data || [];

        // Merge and Deduplicate
        const combined = [...data1, ...data2];
        const uniqueMap = new Map<string, Ringtone>();
        combined.forEach(item => uniqueMap.set(item.id, item));
        const finalData = Array.from(uniqueMap.values());

        // Client-side precise filtering for the "Name Match" part (Query 1 results mainly)
        // We trust Query 2 (Movie Match) explicitly.
        // For Query 1, we still do the precise check to avoid "Annarui" matching "Anna".

        const searchLow = artistName.toLowerCase().trim();
        const filtered = finalData.filter(r => {
            // If it came from Movie Match, keep it
            if (additionalMovieNames.includes(r.movie_name)) return true;

            // Otherwise check name match
            const checkMatch = (str: string | undefined | null) => {
                if (!str) return false;
                const parts = str.split(/[,&]|\band\b/i).map(s => s.trim().toLowerCase());
                return parts.includes(searchLow);
            };

            return checkMatch(r.singers) ||
                checkMatch(r.music_director) ||
                checkMatch(r.movie_director) ||
                checkMatch(r.cast_members) ||
                checkMatch(r.lyricist);
        });

        // Re-sort after merge (since we merged two sorted lists, order might be mixed)
        // Simple sort based on sort param
        return filtered.sort((a, b) => {
            if (sort === 'downloads') return (b.downloads || 0) - (a.downloads || 0);
            if (sort === 'likes') return (b.likes || 0) - (a.likes || 0);
            if (sort === 'year_desc') return (parseInt(b.movie_year || '0') || 0) - (parseInt(a.movie_year || '0') || 0);
            if (sort === 'year_asc') return (parseInt(a.movie_year || '0') || 0) - (parseInt(b.movie_year || '0') || 0);
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
    },
    ['artist-ringtones-v3'], // Bump cache version
    { revalidate: 3600 }
);

export default async function ArtistRingtonesList({
    artistName,
    sort,
    view,
    additionalMovieNames = []
}: {
    artistName: string;
    sort?: string;
    view?: string;
    additionalMovieNames?: string[];
}) {
    const currentView = view || 'movies'; // Default to movies
    const ringtones = await getArtistRingtones(artistName, sort, additionalMovieNames);

    if (!ringtones || ringtones.length === 0) {
        return (
            <div className="text-center py-20 text-zinc-500">
                No ringtones found for this artist.
            </div>
        );
    }

    // Group by Movies for "Movies" view & Count
    const moviesMap = new Map<string, Ringtone>();
    ringtones.forEach(r => {
        if (!moviesMap.has(r.movie_name)) {
            moviesMap.set(r.movie_name, r);
        }
    });

    const uniqueMovies = Array.from(moviesMap.values());

    return (
        <>
            {currentView === 'movies' ? (
                /* Movies Grid View */
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {uniqueMovies.map((movie, idx) => (
                        <Link
                            key={movie.movie_name}
                            href={`/movie/${encodeURIComponent(movie.movie_name)}`}
                            className="group relative aspect-2/3 rounded-xl overflow-hidden bg-brand-wash border border-brand-border shadow-md"
                        >
                            <TMDBImage
                                path={movie.poster_url}
                                alt=""
                                fallbackAlt={movie.movie_name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                                priority={idx < 2}
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 mb-1 group-hover:text-brand-accent transition-colors">
                                    {movie.movie_name}
                                </h3>
                                <p className="text-zinc-300 text-xs font-medium">{movie.movie_year}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                /* Rings List View */
                <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
                    {ringtones.map((ringtone) => (
                        <RingtoneCard key={ringtone.id} ringtone={ringtone} />
                    ))}
                </div>
            )}
        </>
    );
}
