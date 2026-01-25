import React from 'react';
import RingtoneCard from '@/components/RingtoneCard';
import TMDBImage from '@/components/TMDBImage';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { unstable_cache } from 'next/cache';
import { Ringtone } from '@/types';

const getArtistRingtones = unstable_cache(
    async (artistName: string, sort: string = 'recent') => {
        let query = supabase
            .from('ringtones')
            .select('*')
            .eq('status', 'approved')
            .or(`singers.ilike.%${artistName}%,music_director.ilike.%${artistName}%,movie_director.ilike.%${artistName}%,cast_members.ilike.%${artistName}%`);

        // Apply Sorting
        switch (sort) {
            case 'downloads':
                query = query.order('downloads', { ascending: false });
                break;
            case 'likes':
                query = query.order('likes', { ascending: false });
                break;
            case 'year_desc':
                query = query.order('movie_year', { ascending: false });
                break;
            case 'year_asc':
                query = query.order('movie_year', { ascending: true });
                break;
            default: // recent
                query = query.order('created_at', { ascending: false });
        }

        const { data } = await query.limit(200); // Fetch more for smart filtering
        if (!data) return [];

        // Exact Name Matching Only: No predictions, no substring matching
        const searchLow = artistName.toLowerCase().trim();

        const filtered = data.filter(r => {
            const checkMatch = (str: string | null) => {
                if (!str) return false;
                // Split by exact separators used in sync (comma, ampersand)
                const parts = str.split(/[,&]|\band\b/i).map(s => s.trim().toLowerCase());
                return parts.includes(searchLow);
            };

            return checkMatch(r.singers) ||
                checkMatch(r.music_director) ||
                checkMatch(r.movie_director) ||
                checkMatch(r.cast_members);
        });

        return filtered;
    },
    ['artist-ringtones-v2'], // Base key
    { revalidate: 3600 }
);

export default async function ArtistRingtonesList({
    artistName,
    sort,
    view
}: {
    artistName: string;
    sort?: string;
    view?: string;
}) {
    const currentView = view || 'movies'; // Default to movies
    const ringtones = await getArtistRingtones(artistName, sort);

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
                <div className="grid grid-cols-2 gap-4">
                    {uniqueMovies.map((movie, idx) => (
                        <Link
                            key={movie.movie_name}
                            href={`/movie/${encodeURIComponent(movie.movie_name)}`}
                            className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-brand-wash border border-brand-border shadow-md"
                        >
                            <TMDBImage
                                path={movie.poster_url}
                                alt={movie.movie_name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 768px) 50vw, 33vw"
                                priority={idx < 2}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
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
                <div className="space-y-4">
                    {ringtones.map((ringtone) => (
                        <RingtoneCard key={ringtone.id} ringtone={ringtone} />
                    ))}
                </div>
            )}
        </>
    );
}
