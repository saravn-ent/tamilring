'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Pause, Music } from 'lucide-react';
import TMDBImage from '@/components/TMDBImage';
import { Ringtone } from '@/types';
import { usePlayer } from '@/context/PlayerContext';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';

interface SoundPosterCardProps {
    ringtone: Ringtone;
    priority?: boolean;
    badge?: string;
}

export default function SoundPosterCard({ ringtone, priority = false, badge }: SoundPosterCardProps) {
    const { currentRingtone, isPlaying, playRingtone, togglePlay } = usePlayer();

    const isCurrent = currentRingtone?.id === ringtone.id;
    const isActive = isCurrent && isPlaying;

    const handlePlay = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        hapticFeedback(hapticPatterns.selection);

        if (isCurrent) {
            togglePlay();
        } else {
            playRingtone(ringtone);
        }
    };

    return (
        <Link
            href={`/ringtone/${ringtone.slug}`}
            className="snap-start shrink-0 w-[130px] sm:w-[150px] md:w-full group cursor-pointer block text-left transition-all duration-300"
        >
            {/* 2:3 Full-View Cinema Movie Poster */}
            <div className="relative w-[130px] sm:w-[150px] md:w-full aspect-[2/3] rounded-2xl overflow-hidden mb-2 bg-m3-surface-container-high border border-m3-outline-variant/30 shadow-sm group-hover:shadow-xl group-hover:border-m3-primary/50 group-hover:-translate-y-1 transition-all duration-300">
                {/* Full Uncropped Movie Poster Artwork */}
                <TMDBImage
                    path={ringtone.poster_url}
                    alt={ringtone.title}
                    fallbackAlt={ringtone.title}
                    fill
                    priority={priority}
                    sizes="(max-width: 640px) 130px, (max-width: 1024px) 150px, 18vw"
                    quality={80}
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Subtle Vignette for Contrast */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25 transition-opacity duration-300 ${
                    isActive ? 'opacity-90 ring-2 ring-m3-primary ring-inset' : 'opacity-60 group-hover:opacity-75'
                }`} />

                {/* Minimal Top Badges (No large intrusive stickers) */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20 pointer-events-none">
                    {badge ? (
                        <span className="text-[9px] font-bold tracking-tight bg-m3-primary text-white px-2 py-0.5 rounded-full shadow-md">
                            {badge}
                        </span>
                    ) : ringtone.duration ? (
                        <span className="text-[9px] font-bold bg-black/65 backdrop-blur-md text-white/90 px-2 py-0.5 rounded-full border border-white/10 tracking-tight">
                            {Math.round(ringtone.duration)}s
                        </span>
                    ) : (
                        <span className="text-[9px] font-bold bg-black/65 backdrop-blur-md text-white/90 px-1.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
                            <Music size={9} /> Tone
                        </span>
                    )}

                    {/* Equalizer Wave when playing */}
                    {isActive && (
                        <div className="flex items-end gap-0.5 h-3.5 bg-m3-primary/90 backdrop-blur-md px-1.5 py-0.5 rounded-full">
                            <div className="w-0.5 bg-white rounded-full animate-music-bar-1" />
                            <div className="w-0.5 bg-white rounded-full animate-music-bar-2" />
                            <div className="w-0.5 bg-white rounded-full animate-music-bar-3" />
                        </div>
                    )}
                </div>

                {/* Floating Tactile Play Button (Bottom Right) */}
                <div className="absolute bottom-2.5 right-2.5 z-30">
                    <button
                        type="button"
                        onClick={handlePlay}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 cursor-pointer ${
                            isActive
                                ? 'bg-m3-primary text-white shadow-lg shadow-m3-primary/50 scale-105'
                                : 'bg-white/90 text-black shadow-md hover:scale-110 hover:bg-m3-primary hover:text-white active:scale-95'
                        }`}
                        aria-label={isActive ? `Pause ${ringtone.title}` : `Play ${ringtone.title}`}
                    >
                        {isActive ? (
                            <Pause size={16} fill="currentColor" />
                        ) : (
                            <Play size={16} fill="currentColor" className="ml-0.5" />
                        )}
                    </button>
                </div>

                {/* Bottom Left Mood Tag */}
                {ringtone.mood && (
                    <div className="absolute bottom-2.5 left-2.5 z-20 pointer-events-none">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-white/80 bg-black/50 backdrop-blur-xs px-1.5 py-0.5 rounded">
                            {ringtone.mood}
                        </span>
                    </div>
                )}
            </div>

            {/* Song Meta Below Artwork */}
            <div className="px-0.5">
                <h4 className="text-xs sm:text-sm font-bold text-m3-on-surface line-clamp-1 leading-snug group-hover:text-m3-primary transition-colors tracking-tight">
                    {ringtone.title}
                </h4>
                <p className="text-[11px] text-m3-outline truncate mt-0.5 font-medium leading-tight">
                    {ringtone.movie_name || 'Tamil Cinema'}
                    {ringtone.music_director ? ` • ${ringtone.music_director}` : ''}
                </p>
            </div>
        </Link>
    );
}
