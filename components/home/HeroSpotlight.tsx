'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, Pause, SkipBack, SkipForward, ArrowRight, Heart, Film } from 'lucide-react';
import TMDBImage from '@/components/TMDBImage';
import { Ringtone } from '@/types';
import { usePlayer, usePlayerProgress } from '@/context/PlayerContext';
import { useFavorites } from '@/context/FavoritesContext';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';

interface HeroSpotlightProps {
    tracks: Ringtone[];
}

export default function HeroSpotlight({ tracks }: HeroSpotlightProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { currentRingtone, isPlaying, playRingtone, togglePlay } = usePlayer();
    const { progress, duration } = usePlayerProgress();
    const { isFavorite, addFavorite, removeFavorite } = useFavorites();

    if (!tracks || tracks.length === 0) return null;

    const spotlight = tracks[currentIndex] || tracks[0];
    const isCurrent = currentRingtone?.id === spotlight.id;
    const isActive = isCurrent && isPlaying;
    const isFav = isFavorite(spotlight.id);

    const handlePlaySpotlight = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        hapticFeedback(hapticPatterns.selection);
        if (isCurrent) {
            togglePlay();
        } else {
            playRingtone(spotlight, 'spotlight');
        }
    };

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        hapticFeedback(hapticPatterns.selection);
        const nextIdx = (currentIndex + 1) % tracks.length;
        setCurrentIndex(nextIdx);
        if (isActive) {
            playRingtone(tracks[nextIdx], 'spotlight');
        }
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        hapticFeedback(hapticPatterns.selection);
        const prevIdx = (currentIndex - 1 + tracks.length) % tracks.length;
        setCurrentIndex(prevIdx);
        if (isActive) {
            playRingtone(tracks[prevIdx], 'spotlight');
        }
    };

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isFav) {
            removeFavorite(spotlight.id);
            hapticFeedback(hapticPatterns.selection);
        } else {
            addFavorite({
                id: spotlight.id,
                name: spotlight.title,
                type: 'Ringtone',
                imageUrl: spotlight.poster_url,
                href: `/ringtone/${spotlight.slug}`,
                ringtoneData: spotlight
            });
            hapticFeedback(hapticPatterns.heartbeat);
        }
    };

    const totalSecs = spotlight.duration ? Math.round(spotlight.duration) : 32;
    const elapsedSecs = isCurrent && duration > 0 ? Math.round((progress / 100) * totalSecs) : 0;
    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <section aria-label="Cinema Spotlight Player" className="w-full max-w-7xl mx-auto px-1 sm:px-4 pt-3 sm:pt-4 mb-4">
            {/* CINEMA SPOTLIGHT CARD */}
            <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/15 dark:border-white/10 group transition-all duration-500">
                {/* Cinematic Movie Picture Backdrop with Black Gradient Fade */}
                <div className="absolute inset-0 bg-zinc-950 overflow-hidden pointer-events-none">
                    <TMDBImage
                        key={spotlight.id}
                        path={spotlight.backdrop_url || spotlight.poster_url}
                        alt=""
                        fallbackAlt={spotlight.title}
                        fill
                        priority
                        fetchPriority="high"
                        sizes="(max-width: 640px) 384px, (max-width: 1024px) 95vw, 1200px"
                        quality={60}
                        className="object-cover object-right sm:object-center opacity-60"
                    />
                    {/* Multi-Stop Black Gradient Overlays: Rich black on left & bottom for contrast, artwork visible on right */}
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/20 sm:to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
                </div>

                {/* Content Container (Streamlined vertical padding for optimal thumb reach) */}
                <div className="relative z-10 p-4 sm:p-6 md:p-7">
                    {/* 1. TOP: Visual Album Art on Left + Track Lore */}
                    <div className="flex items-center gap-3.5 sm:gap-5 mb-3.5 sm:mb-4">
                        {/* Visual Album Art on Left (Sweet spot size: 88px mobile / 112px desktop) */}
                        <div
                            onClick={handlePlaySpotlight}
                            className="relative w-22 h-22 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 shrink-0 cursor-pointer group/art active:scale-95 transition-all duration-300"
                            title={isActive ? 'Pause' : 'Play Preview'}
                        >
                            <TMDBImage
                                key={spotlight.id}
                                path={spotlight.poster_url}
                                alt={spotlight.title}
                                fill
                                priority={false}
                                sizes="(max-width: 640px) 88px, 128px"
                                className={`object-cover transition-transform duration-700 ${
                                    isActive ? 'scale-105' : 'group-hover/art:scale-105'
                                }`}
                            />

                            {/* Floating Overlay Play Indicator on Art */}
                            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
                                isActive ? 'opacity-100' : 'opacity-0 group-hover/art:opacity-100'
                            }`}>
                                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 text-black flex items-center justify-center shadow-lg transform group-hover/art:scale-110 transition-transform">
                                    {isActive ? (
                                        <Pause size={18} fill="currentColor" />
                                    ) : (
                                        <Play size={18} fill="currentColor" className="ml-0.5" />
                                    )}
                                </div>
                            </div>

                            {/* Vinyl Ring Overlay */}
                            <div className="absolute inset-0 rounded-xl sm:rounded-2xl ring-1 ring-inset ring-white/20 pointer-events-none" />
                        </div>

                        {/* Track Info Beside Artwork */}
                        <div className="min-w-0 flex-1">
                            <Link href={`/ringtone/${spotlight.slug}`} prefetch={false} className="group/title block">
                                <h2 className="text-[13px] sm:text-base md:text-xl font-bold text-white tracking-tight leading-snug line-clamp-2 group-hover/title:text-m3-primary transition-colors">
                                    {spotlight.title}
                                </h2>
                            </Link>

                            <Link href={`/movie/${encodeURIComponent(spotlight.movie_name)}`} prefetch={false} className="inline-flex items-center min-h-[28px] py-0.5 hover:underline">
                                <p className="text-[11px] sm:text-xs text-zinc-300 font-semibold truncate">
                                    {spotlight.movie_name || 'Tamil Cinema'}
                                </p>
                            </Link>

                            <p className="text-[10px] sm:text-[11px] text-zinc-400 font-medium truncate mt-0.5">
                                {spotlight.music_director ? `Composed by ${spotlight.music_director}` : 'Original BGM'}
                            </p>

                            {/* Duration & Mood Tags */}
                            <div className="flex items-center gap-1.5 mt-1.5">
                                <span className="text-[9px] sm:text-[10px] font-semibold text-white/90 bg-white/10 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/10">
                                    {totalSecs}s Cut
                                </span>
                                {spotlight.mood && (
                                    <span className="text-[9px] sm:text-[10px] font-bold uppercase text-amber-300 bg-amber-950/60 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-amber-500/30">
                                        {spotlight.mood}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 2. PROGRESS ROW: Full-Width Clean Continuous Scrubber & Timestamps */}
                    <div className="space-y-1 mb-3.5 sm:mb-4 px-0.5">
                        <div className="relative w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-m3-primary via-rose-500 to-amber-400 rounded-full transition-all duration-150"
                                style={{ width: `${isCurrent ? progress : 0}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-zinc-300 font-semibold px-0.5">
                            <span>{formatTime(elapsedSecs)}</span>
                            <span>{formatTime(totalSecs)}</span>
                        </div>
                    </div>

                    {/* 3. STYLE 2 SYMMETRICAL CONTROL ROW: [ Explore Album ] ── [ ⏮️ ] [ ⏯️ ] [ ⏭️ ] ── [ ❤️ Like ] */}
                    <div className="flex items-center justify-between gap-2 sm:gap-4">
                        {/* Left Wing: Explore Movie Album Link */}
                        <Link
                            href={`/movie/${encodeURIComponent(spotlight.movie_name)}`}
                            prefetch={false}
                            className="inline-flex items-center gap-1.5 h-9 sm:h-10 px-3 sm:px-4 rounded-full font-bold text-[11px] sm:text-xs text-white bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 shadow-xs shrink-0"
                            title={`Explore all tracks from ${spotlight.movie_name}`}
                        >
                            <Film size={13} />
                            <span>Explore Album</span>
                            <ArrowRight size={12} />
                        </Link>

                        {/* Center: Symmetrical Transport Trio */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* Backward Track Button */}
                            <button
                                type="button"
                                onClick={handlePrev}
                                aria-label="Previous track"
                                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border border-white/15 backdrop-blur-md transition-all duration-200 active:scale-90 cursor-pointer shadow-sm"
                                title="Previous Soundbite"
                            >
                                <SkipBack size={17} fill="currentColor" />
                            </button>

                            {/* Play / Pause Centerpiece Disc */}
                            <button
                                type="button"
                                onClick={handlePlaySpotlight}
                                aria-label={isActive ? 'Pause' : 'Play'}
                                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg active:scale-90 shrink-0 ${
                                    isActive
                                        ? 'bg-white text-zinc-950 shadow-white/30 scale-105 ring-2 ring-white'
                                        : 'bg-m3-primary hover:bg-m3-primary/90 text-white shadow-m3-primary/50 hover:scale-108'
                                }`}
                                title={isActive ? 'Pause' : 'Play'}
                            >
                                {isActive ? (
                                    <Pause size={19} fill="currentColor" />
                                ) : (
                                    <Play size={19} fill="currentColor" className="ml-0.5" />
                                )}
                            </button>

                            {/* Forward Track Button */}
                            <button
                                type="button"
                                onClick={handleNext}
                                aria-label="Next track"
                                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border border-white/15 backdrop-blur-md transition-all duration-200 active:scale-90 cursor-pointer shadow-sm"
                                title="Next Soundbite"
                            >
                                <SkipForward size={17} fill="currentColor" />
                            </button>
                        </div>

                        {/* Right Wing: Heart Like Button */}
                        <button
                            type="button"
                            onClick={handleToggleFavorite}
                            aria-label={isFav ? "Remove from favorites" : "Save to favorites"}
                            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer backdrop-blur-md border shrink-0 shadow-sm ${
                                isFav
                                    ? 'bg-rose-500/25 border-rose-500/40 text-rose-500'
                                    : 'bg-white/10 hover:bg-white/20 border-white/15 text-white/80 hover:text-white'
                            }`}
                            title={isFav ? "Saved to Favorites" : "Save to Favorites"}
                        >
                            <Heart size={18} className={isFav ? "fill-rose-500 text-rose-500" : ""} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
