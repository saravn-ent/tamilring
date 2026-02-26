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
        <div className="px-4 pb-4 space-y-3 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
            {releases.map((release) => (
                <button
                    key={release.movie_name}
                    type="button"
                    onClick={() => handleClick(release.movie_name)}
                    className="flex text-left w-full items-center gap-3 sm:gap-4 bg-white border border-zinc-200 rounded-xl p-3 sm:p-4 transition-all duration-200 hover:border-zinc-300 hover:shadow-md cursor-pointer active:scale-[0.98] active:bg-zinc-50 group focus:outline-none"
                >
                    {/* Left Section: Poster */}
                    <div className="relative w-16 h-24 sm:w-20 sm:h-28 rounded-xl overflow-hidden shrink-0 border border-brand-border bg-brand-wash shadow-sm group-hover:shadow-brand-accent/20 transition-all">
                        <TMDBImage
                            path={release.poster_url}
                            alt={release.movie_name}
                            fallbackAlt={release.movie_name}
                            fill
                            sizes="(max-width: 640px) 64px, 80px"
                            quality={75}
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* NEW badge */}
                        <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 bg-brand-accent/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md z-20 shadow-sm">
                            <Sparkles size={10} className="text-white fill-white" />
                        </div>
                    </div>

                    {/* Content Info */}
                    <div className="flex-1 min-w-0 py-1">
                        <h3 className="text-sm sm:text-[15px] font-bold text-zinc-900 line-clamp-2 leading-tight group-hover:text-brand-accent transition-colors">
                            {release.movie_name}
                        </h3>
                        
                        <div className="flex flex-col gap-1.5 mt-2">
                            {release.movie_year && (
                                <div className="flex items-center">
                                    <span className="bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded text-[10px] font-black border border-zinc-200/80 leading-none">
                                        {release.movie_year}
                                    </span>
                                </div>
                            )}
                            <span className="text-xs font-semibold text-zinc-500">
                                {release.ringtone_count} ringtone{release.ringtone_count !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
}
