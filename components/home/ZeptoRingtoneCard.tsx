'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Pause } from 'lucide-react';
import TMDBImage from '@/components/TMDBImage';
import { Ringtone } from '@/types';
import { usePlayer } from '@/context/PlayerContext';
import { hapticFeedback } from '@/lib/haptics';

import { M3Badge } from '@/components/ui/m3';

interface ZeptoRingtoneCardProps {
    ringtone: Ringtone;
    priority?: boolean;
    badge?: string;
}

export default function ZeptoRingtoneCard({ ringtone, priority = false, badge }: ZeptoRingtoneCardProps) {
    const { currentRingtone, isPlaying, playRingtone, togglePlay } = usePlayer();

    const isCurrent = currentRingtone?.id === ringtone.id;
    const isActive = isCurrent && isPlaying;

    const handlePlay = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        hapticFeedback(25);

        if (isCurrent) {
            togglePlay();
        } else {
            setTimeout(() => {
                playRingtone(ringtone);
            }, 0);
        }
    };

    return (
        <Link
            href={`/ringtone/${ringtone.slug}`}
            prefetch={false}
            className="snap-start shrink-0 w-[112px] sm:w-[126px] md:w-full group cursor-pointer block text-left"
        >
            {/* 1:1 Square Artwork Container with M3 Small Corner FAB */}
            <div className="relative w-[112px] h-[112px] sm:w-[126px] sm:h-[126px] md:w-full md:h-auto md:aspect-square rounded-2xl overflow-hidden mb-1.5 bg-m3-surface-container-high border border-m3-outline-variant/40 shadow-2xs group-hover:shadow-md transition-all active:scale-95">
                <TMDBImage
                    path={ringtone.poster_url}
                    alt=""
                    fallbackAlt={ringtone.title}
                    fill
                    priority={priority}
                    sizes="(max-width: 640px) 112px, (max-width: 1024px) 126px, 16vw"
                    quality={75}
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Subtle vignette */}
                <div className={`absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/30 transition-opacity duration-300 ${isActive ? 'opacity-90' : 'opacity-50 group-hover:opacity-75'}`} />

                {/* Top Left Badge (M3 Badge) */}
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 z-20">
                    {badge ? (
                        <M3Badge variant="tertiary" className="text-[9px] px-1.5 py-0.5 leading-none shadow-xs">
                            {badge}
                        </M3Badge>
                    ) : ringtone.duration ? (
                        <span className="text-[9px] font-bold bg-black/60 backdrop-blur-xs text-white px-1.5 py-0.5 rounded-md leading-none">
                            {Math.round(ringtone.duration)}s
                        </span>
                    ) : null}
                </div>


                {/* Playing Equalizer Animation (Top Right) */}
                {isActive && (
                    <div className="absolute top-1.5 right-1.5 flex gap-0.5 items-end h-3 z-20 bg-black/50 backdrop-blur-xs px-1 py-0.5 rounded-md">
                        <div className="w-0.5 bg-m3-primary rounded-full animate-music-bar-1" />
                        <div className="w-0.5 bg-m3-primary rounded-full animate-music-bar-2" />
                        <div className="w-0.5 bg-m3-primary rounded-full animate-music-bar-3" />
                    </div>
                )}

                {/* Floating Corner Play FAB */}
                <div className="absolute bottom-1.5 right-1.5 z-30">
                    <button
                        type="button"
                        onClick={handlePlay}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer ${
                            isActive
                                ? 'bg-m3-primary text-m3-on-primary ring-2 ring-m3-surface scale-105 shadow-m3-primary/40'
                                : 'bg-m3-surface text-m3-on-surface border border-m3-outline-variant/60 hover:bg-m3-primary hover:text-m3-on-primary hover:border-transparent'
                        }`}
                        aria-label={isActive ? `Pause ${ringtone.title}` : `Play ${ringtone.title}`}
                    >
                        {isActive ? (
                            <Pause size={15} fill="currentColor" />
                        ) : (
                            <Play size={15} fill="currentColor" className="ml-0.5" />
                        )}
                    </button>
                </div>
            </div>

            {/* Micro Meta Row (Quality & Social Proof) */}
            <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9px] font-bold text-m3-primary-container bg-m3-primary/10 px-1 py-0.2 rounded leading-none">
                    HQ 320k
                </span>
                {ringtone.likes && ringtone.likes > 0 ? (
                    <span className="text-[9px] font-medium text-m3-on-surface-variant">
                        ❤️ {ringtone.likes}
                    </span>
                ) : null}
            </div>

            {/* Song Title (2 Lines Max, Bold) */}
            <h3 className="text-xs font-bold text-m3-on-surface line-clamp-2 leading-tight group-hover:text-m3-primary transition-colors">
                {ringtone.title}
            </h3>

            {/* Movie Name Subtext */}
            <p className="text-[10px] text-m3-on-surface-variant truncate mt-0.5 font-medium">
                {ringtone.movie_name || 'Tamil BGM'}
            </p>
        </Link>
    );
}

