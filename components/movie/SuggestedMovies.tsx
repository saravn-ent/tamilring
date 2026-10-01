import React from 'react';
import Link from 'next/link';
import { Film, Clapperboard, ChevronRight } from 'lucide-react';
import TMDBImage from '@/components/TMDBImage';
import { supabase } from '@/lib/supabaseClient';
import { unstable_cache } from 'next/cache';

export interface SuggestedMovie {
    movie_name: string;
    poster_url: string;
    movie_year: string;
    ringtone_count: number;
    music_director?: string | null;
}

interface SuggestedMoviesProps {
    currentMovie: string;
    musicDirector?: string | null;
}

const getSuggestedMovies = unstable_cache(
    async (currentMovie: string, musicDirector?: string | null): Promise<{
        movies: SuggestedMovie[];
        isDirectorSpecific: boolean;
    }> => {
        const movieMap = new Map<string, SuggestedMovie & { score: number }>();
        let isDirectorSpecific = false;

        // 1. Try finding other movies by the same music director first
        if (musicDirector && musicDirector.trim().length > 0) {
            const { data: directorTracks } = await supabase
                .from('ringtones')
                .select('movie_name, poster_url, movie_year, music_director, downloads, likes')
                .eq('status', 'approved')
                .eq('music_director', musicDirector.trim())
                .neq('movie_name', currentMovie)
                .not('poster_url', 'is', null)
                .neq('poster_url', '')
                .limit(100);

            if (directorTracks && directorTracks.length > 0) {
                for (const r of directorTracks) {
                    if (!r.movie_name || r.movie_name.toLowerCase() === currentMovie.toLowerCase()) continue;
                    if (movieMap.has(r.movie_name)) {
                        const item = movieMap.get(r.movie_name)!;
                        item.ringtone_count++;
                        item.score += 10 + (r.downloads || 0);
                    } else {
                        movieMap.set(r.movie_name, {
                            movie_name: r.movie_name,
                            poster_url: r.poster_url,
                            movie_year: r.movie_year || '',
                            music_director: r.music_director || musicDirector,
                            ringtone_count: 1,
                            score: 50 + (r.downloads || 0),
                        });
                    }
                }
                if (movieMap.size >= 4) {
                    isDirectorSpecific = true;
                }
            }
        }

        // 2. If we need more movies to fill a full rail (up to 8), backfill with top approved movies
        if (movieMap.size < 8) {
            const { data: popularTracks } = await supabase
                .from('ringtones')
                .select('movie_name, poster_url, movie_year, music_director, downloads, likes')
                .eq('status', 'approved')
                .neq('movie_name', currentMovie)
                .not('poster_url', 'is', null)
                .neq('poster_url', '')
                .order('downloads', { ascending: false })
                .limit(120);

            if (popularTracks) {
                for (const r of popularTracks) {
                    if (!r.movie_name || r.movie_name.toLowerCase() === currentMovie.toLowerCase()) continue;
                    if (movieMap.has(r.movie_name)) {
                        const item = movieMap.get(r.movie_name)!;
                        item.ringtone_count++;
                    } else if (movieMap.size < 12) {
                        movieMap.set(r.movie_name, {
                            movie_name: r.movie_name,
                            poster_url: r.poster_url,
                            movie_year: r.movie_year || '',
                            music_director: r.music_director || null,
                            ringtone_count: 1,
                            score: r.downloads || 0,
                        });
                    }
                }
            }
        }

        const sortedMovies = Array.from(movieMap.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map(({ movie_name, poster_url, movie_year, ringtone_count, music_director }) => ({
                movie_name,
                poster_url,
                movie_year,
                ringtone_count,
                music_director,
            }));

        return {
            movies: sortedMovies,
            isDirectorSpecific,
        };
    },
    ['suggested-movies-v1'],
    { revalidate: 3600, tags: ['movies', 'suggestions'] }
);

export default async function SuggestedMovies({ currentMovie, musicDirector }: SuggestedMoviesProps) {
    const { movies, isDirectorSpecific } = await getSuggestedMovies(currentMovie, musicDirector);

    if (!movies || movies.length === 0) return null;

    const sectionTitle = isDirectorSpecific && musicDirector
        ? `More from ${musicDirector}`
        : 'Suggested Movies';

    const sectionSubtitle = isDirectorSpecific && musicDirector
        ? `Soundtrack collections & ringtones composed by ${musicDirector}`
        : 'Popular Tamil movies & ringtone albums';

    return (
        <section aria-label={sectionTitle} className="mt-12 pt-6 border-t border-m3-outline-variant/30">
            {/* Header Row */}
            <div className="flex items-end justify-between mb-4 px-1">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-m3-primary/10 text-m3-primary flex items-center justify-center shrink-0">
                        <Clapperboard size={18} />
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-m3-on-surface tracking-tight">
                            {sectionTitle}
                        </h3>
                        <p className="text-xs text-m3-on-surface-variant line-clamp-1">
                            {sectionSubtitle}
                        </p>
                    </div>
                </div>

                <Link
                    href="/categories"
                    className="inline-flex items-center gap-0.5 text-xs font-semibold text-m3-primary hover:underline shrink-0"
                >
                    <span>All Movies</span>
                    <ChevronRight size={14} />
                </Link>
            </div>

            {/* Horizontal Rail on Mobile, Clean Responsive Grid on Desktop */}
            <div className="flex gap-2.5 sm:gap-3 overflow-x-auto px-1 pb-3 scrollbar-hide snap-x md:grid md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 md:overflow-visible">
                {movies.map((movie, idx) => (
                    <Link
                        key={movie.movie_name}
                        href={`/movie/${encodeURIComponent(movie.movie_name)}`}
                        className="snap-start shrink-0 w-[105px] sm:w-[120px] md:w-full group cursor-pointer block text-left transition-all duration-300"
                    >
                        {/* 2:3 Aspect Cinema Poster */}
                        <div className="relative w-[105px] sm:w-[120px] md:w-full aspect-[2/3] rounded-xl sm:rounded-2xl overflow-hidden mb-1.5 bg-neutral-900 border border-m3-outline-variant/30 shadow-2xs group-hover:shadow-md group-hover:border-m3-primary/50 group-hover:-translate-y-0.5 transition-all duration-300">
                            <TMDBImage
                                path={movie.poster_url}
                                alt={movie.movie_name}
                                fallbackAlt={movie.movie_name}
                                fill
                                priority={idx < 4}
                                sizes="(max-width: 640px) 105px, (max-width: 1024px) 120px, 14vw"
                                quality={75}
                                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            />

                            {/* Bottom Contrast Vignette */}
                            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none z-10" />

                            {/* Badges on Poster */}
                            <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between z-20 pointer-events-none">
                                <span className="text-[8px] font-bold text-white/90 bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-white/10">
                                    <Film size={8} className="text-rose-400" />
                                    <span>{movie.ringtone_count} {movie.ringtone_count === 1 ? 'Cut' : 'Cuts'}</span>
                                </span>
                                {movie.movie_year && (
                                    <span className="text-[8px] font-bold text-white/80 bg-black/60 backdrop-blur-xs px-1 py-0.5 rounded border border-white/10">
                                        {movie.movie_year}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Text Metadata */}
                        <div className="px-0.5">
                            <h4 className="text-xs font-bold text-m3-on-surface line-clamp-1 leading-tight group-hover:text-m3-primary transition-colors tracking-tight">
                                {movie.movie_name}
                            </h4>
                            <p className="text-[10px] text-m3-outline truncate mt-0.5 font-medium leading-tight">
                                {movie.music_director || 'Tamil Cinema'}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
