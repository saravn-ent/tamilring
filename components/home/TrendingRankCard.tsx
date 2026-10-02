'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Pause } from 'lucide-react';
import TMDBImage from '@/components/TMDBImage';
import { Ringtone } from '@/types';
import { usePlayer } from '@/context/PlayerContext';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';

interface TrendingRankCardProps {
    ringtone: Ringtone;
    rank: number;
    priority?: boolean;
}

function formatDownloads(count?: number): string {
    if (!count || count <= 0) return '';
    if (count >= 1000000) return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return count.toString();
}

export default function TrendingRankCard({ ringtone, rank, priority = false }: TrendingRankCardProps) {
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

    // Uniform 2-digit rank string
    const rankStr = String(rank).padStart(2, '0');

    return (
        <Link
            href={`/ringtone/${ringtone.slug}`}
            prefetch={false}
            className={`group relative flex items-center gap-2.5 sm:gap-3 p-2 rounded-2xl transition-all duration-200 cursor-pointer border text-left active:scale-[0.99] ${
                isActive
                    ? 'bg-m3-primary/10 border-m3-primary/40 shadow-xs ring-1 ring-m3-primary/30'
                    : 'bg-m3-surface-container/60 hover:bg-m3-surface-container-high border-m3-outline-variant/30 hover:border-m3-primary/30 shadow-2xs'
            }`}
        >
            {/* Uniform Rank Number */}
            <div className="w-7 sm:w-8 shrink-0 flex items-center justify-center text-center">
                <span
                    className={`text-sm sm:text-base font-black tabular-nums tracking-tight transition-colors ${
                        isActive
                            ? 'text-m3-primary'
                            : 'text-m3-outline group-hover:text-m3-on-surface'
                    }`}
                >
                    {rankStr}
                </span>
            </div>

            {/* Compact Artwork (Square 50x50 with rounded corners) */}
            <div className="relative w-[48px] h-[48px] sm:w-[52px] sm:h-[52px] rounded-xl overflow-hidden shrink-0 bg-m3-surface-container-high border border-m3-outline-variant/30 shadow-2xs group-hover:scale-105 transition-transform duration-300">
                <TMDBImage
                    path={ringtone.poster_url}
                    alt={ringtone.title}
                    fallbackAlt={ringtone.title}
                    fill
                    priority={priority}
                    sizes="52px"
                    quality={75}
                    className="object-cover"
                />

                {/* Subtle dark vignette */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 transition-opacity ${
                    isActive ? 'opacity-80' : 'opacity-40 group-hover:opacity-60'
                }`} />

                {/* Active Audio Wave Equalizer Overlay */}
                {isActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                        <div className="flex items-end gap-0.5 h-3">
                            <div className="w-0.5 bg-white rounded-full animate-music-bar-1" />
                            <div className="w-0.5 bg-white rounded-full animate-music-bar-2" />
                            <div className="w-0.5 bg-white rounded-full animate-music-bar-3" />
                        </div>
                    </div>
                )}
            </div>

            {/* Song Meta (Title, Movie, Composer, Stats) */}
            <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                    <h3 className={`text-xs sm:text-sm font-bold truncate transition-colors leading-snug ${
                        isActive ? 'text-m3-primary' : 'text-m3-on-surface group-hover:text-m3-primary'
                    }`}>
                        {ringtone.title}
                    </h3>
                </div>

                <p className="text-[11px] text-m3-on-surface-variant truncate mt-0.5 font-medium leading-tight">
                    {ringtone.movie_name || 'Tamil Cinema'}
                    {ringtone.music_director ? ` • ${ringtone.music_director}` : ''}
                </p>

                {/* Micro Badges (Downloads / Duration / Mood) */}
                <div className="flex items-center gap-1.5 mt-1">
                    {ringtone.downloads > 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-m3-on-surface-variant bg-m3-surface-container-highest/70 px-1.5 py-0.5 rounded leading-none">
                            🔥 {formatDownloads(ringtone.downloads)}
                        </span>
                    ) : null}
                    {ringtone.duration && ringtone.duration > 0 ? (
                        <span className="text-[10px] font-semibold text-m3-on-surface-variant leading-none">
                            {Math.round(ringtone.duration)}s
                        </span>
                    ) : null}
                    {ringtone.mood && !ringtone.downloads ? (
                        <span className="text-[9px] uppercase font-bold text-m3-primary/80 bg-m3-primary/10 px-1.5 py-0.5 rounded leading-none">
                            {ringtone.mood}
                        </span>
                    ) : null}
                </div>
            </div>

            {/* Quick Play/Pause Action Button */}
            <button
                type="button"
                onClick={handlePlay}
                aria-label={isActive ? `Pause ${ringtone.title}` : `Play ${ringtone.title}`}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                    isActive
                        ? 'bg-m3-primary text-white shadow-md shadow-m3-primary/30 scale-105'
                        : 'bg-m3-surface-container-highest/80 text-m3-on-surface hover:bg-m3-primary hover:text-white group-hover:bg-m3-primary group-hover:text-white active:scale-95'
                }`}
            >
                {isActive ? (
                    <Pause size={15} fill="currentColor" />
                ) : (
                    <Play size={15} fill="currentColor" className="ml-0.5" />
                )}
            </button>
        </Link>
    );
}
