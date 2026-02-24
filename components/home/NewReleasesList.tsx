'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import TMDBImage from '@/components/TMDBImage';
import { Sparkles } from 'lucide-react';

interface NewRelease {
    movie_name: string;
    poster_url: string;
    movie_year: string;
    ringtone_count: number;
}

interface NewReleasesListProps {
    releases: NewRelease[];
}

export default function NewReleasesList({ releases }: NewReleasesListProps) {
    const router = useRouter();

    const handleClick = (movieName: string) => {
        router.push(`/movie/${encodeURIComponent(movieName)}`);
    };

    return (
        <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 md:overflow-visible">
            {releases.map((release) => (
                <button
                    key={release.movie_name}
                    type="button"
                    onClick={() => handleClick(release.movie_name)}
                    className="snap-start shrink-0 w-32 sm:w-36 md:w-full group cursor-pointer text-left focus:outline-none"
                >
                    {/* Poster */}
                    <div className="relative w-32 sm:w-36 md:w-full h-44 sm:h-48 md:h-auto md:aspect-2/3 rounded-xl overflow-hidden mb-2 bg-brand-wash shadow-lg group-hover:shadow-brand-accent/30 transition-all border border-brand-border/50 active:scale-95">
                        <TMDBImage
                            path={release.poster_url}
                            alt={release.movie_name}
                            fallbackAlt={release.movie_name}
                            fill
                            sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 13vw"
                            quality={75}
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                        {/* NEW badge */}
                        <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-brand-accent/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full z-20">
                            <Sparkles size={9} className="text-white" />
                            <span className="text-[9px] font-bold text-white tracking-wide uppercase">New</span>
                        </div>

                        {/* Year badge */}
                        <div className="absolute top-2 right-2 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white font-medium backdrop-blur-sm z-20">
                            {release.movie_year}
                        </div>

                        {/* Ringtone count */}
                        <div className="absolute bottom-2 left-2 right-2 z-20">
                            <p className="text-[10px] text-white/80 font-medium">
                                {release.ringtone_count} ringtone{release.ringtone_count !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    {/* Movie name */}
                    <p className="text-xs font-bold text-black truncate group-hover:text-brand-accent transition-colors leading-snug px-0.5">
                        {release.movie_name}
                    </p>
                </button>
            ))}
        </div>
    );
}
