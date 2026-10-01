'use client';

import React from 'react';
import Link from 'next/link';
import TMDBImage from '@/components/TMDBImage';
import { Film } from 'lucide-react';

export interface NewRelease {
    movie_name: string;
    poster_url: string;
    movie_year: string;
    ringtone_count: number;
    music_director?: string | null;
}

interface NewReleasesListProps {
    releases: NewRelease[];
}

export default function NewReleasesList({ releases }: NewReleasesListProps) {
    if (!releases || releases.length === 0) return null;

    return (
        <div className="flex gap-2 sm:gap-2.5 overflow-x-auto px-3 sm:px-4 pb-2.5 scrollbar-hide snap-x md:grid md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 md:overflow-visible">
            {releases.map((release, idx) => (
                <Link
                    key={release.movie_name}
                    href={`/movie/${encodeURIComponent(release.movie_name)}`}
                    className="snap-start shrink-0 w-[98px] sm:w-[110px] md:w-full group cursor-pointer block text-left transition-all duration-300"
                >
                    {/* 2:3 Full Vertical Cinema Movie Poster */}
                    <div className="relative w-[98px] sm:w-[110px] md:w-full aspect-[2/3] rounded-xl overflow-hidden mb-1.5 bg-neutral-900 border border-m3-outline-variant/30 shadow-2xs group-hover:shadow-md group-hover:border-m3-primary/40 group-hover:-translate-y-1 transition-all duration-300">
                        {/* High-Resolution Movie Poster Artwork */}
                        <TMDBImage
                            path={release.poster_url}
                            alt={release.movie_name}
                            fallbackAlt={release.movie_name}
                            fill
                            priority={idx < 4}
                            sizes="(max-width: 640px) 98px, (max-width: 1024px) 110px, 14vw"
                            quality={75}
                            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />

                        {/* Subtle Bottom Vignette */}
                        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none z-10" />

                        {/* Clean Subtle Badges on Poster */}
                        <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between z-20 pointer-events-none">
                            <span className="text-[8px] font-bold text-white/90 bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-white/10">
                                <Film size={8} className="text-rose-400" />
                                <span>{release.ringtone_count} {release.ringtone_count === 1 ? 'Cut' : 'Cuts'}</span>
                            </span>
                            {release.movie_year && (
                                <span className="text-[8px] font-bold text-white/80 bg-black/60 backdrop-blur-xs px-1 py-0.5 rounded border border-white/10">
                                    {release.movie_year}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Movie Metadata Below Artwork */}
                    <div className="px-0.5">
                        <h4 className="text-xs font-bold text-m3-on-surface line-clamp-1 leading-tight group-hover:text-m3-primary transition-colors tracking-tight">
                            {release.movie_name}
                        </h4>
                        <p className="text-[10px] text-m3-outline truncate mt-0.5 font-medium leading-tight">
                            {release.music_director || 'Tamil Cinema'}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    );
}

