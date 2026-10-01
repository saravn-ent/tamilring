'use client';

import React, { useRef, useState, useCallback } from 'react';
import { usePlayer, usePlayerProgress } from '@/context/PlayerContext';
import { Ringtone } from '@/types';
import { Play, Pause, RotateCcw, RotateCw, Volume2 } from 'lucide-react';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';

interface RingtonePlayerDeckProps {
    ringtone: Ringtone;
    className?: string;
}

function formatSeconds(seconds: number): string {
    if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function RingtonePlayerDeck({ ringtone, className = '' }: RingtonePlayerDeckProps) {
    const { currentRingtone, isPlaying, playRingtone } = usePlayer();
    const { progress, duration, seek } = usePlayerProgress();

    const isCurrent = currentRingtone?.id === ringtone.id;
    const playing = isCurrent && isPlaying;

    const [isDragging, setIsDragging] = useState(false);
    const [dragProgress, setDragProgress] = useState<number | null>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    const activeProgress = isDragging && dragProgress !== null ? dragProgress : (isCurrent ? progress : 0);
    const totalDuration = isCurrent && duration > 0 ? duration : (ringtone.duration || 30);
    const currentTime = (activeProgress / 100) * totalDuration;

    const handlePlayToggle = () => {
        hapticFeedback(hapticPatterns.impact);
        playRingtone(ringtone);
    };

    const calculatePercentage = useCallback((clientX: number) => {
        if (!trackRef.current) return 0;
        const rect = trackRef.current.getBoundingClientRect();
        const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
        return (offsetX / rect.width) * 100;
    }, []);

    const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isCurrent) {
            playRingtone(ringtone);
            return;
        }
        const pct = calculatePercentage(e.clientX);
        hapticFeedback(hapticPatterns.selection);
        seek((pct / 100) * totalDuration);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isCurrent) return;
        setIsDragging(true);
        setDragProgress(calculatePercentage(e.touches[0].clientX));
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        setDragProgress(calculatePercentage(e.touches[0].clientX));
    };

    const handleTouchEnd = () => {
        if (isDragging && dragProgress !== null) {
            seek((dragProgress / 100) * totalDuration);
            hapticFeedback(hapticPatterns.selection);
        }
        setIsDragging(false);
        setDragProgress(null);
    };

    const handleSkip = (offsetSeconds: number) => {
        if (!isCurrent) {
            playRingtone(ringtone);
            return;
        }
        hapticFeedback(hapticPatterns.selection);
        const nextTime = Math.max(0, Math.min(totalDuration, currentTime + offsetSeconds));
        seek(nextTime);
    };

    return (
        <div
            className={`w-full max-w-md bg-m3-surface-container-low/95 border border-m3-outline-variant/40 rounded-3xl p-4 sm:p-5 m3-elevation-1 transition-all duration-300 ${className}`}
        >
            {/* Status Header & Equalizer */}
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                    {playing ? (
                        <div className="flex items-end gap-0.5 h-3.5">
                            <span className="w-1 bg-m3-primary rounded-full animate-[equalizer_0.8s_ease-in-out_infinite]" />
                            <span className="w-1 bg-m3-primary rounded-full animate-[equalizer_1.1s_ease-in-out_0.2s_infinite]" />
                            <span className="w-1 bg-m3-primary rounded-full animate-[equalizer_0.9s_ease-in-out_0.4s_infinite]" />
                            <span className="w-1 bg-m3-primary rounded-full animate-[equalizer_1.2s_ease-in-out_0.1s_infinite]" />
                        </div>
                    ) : (
                        <Volume2 size={15} className="text-m3-on-surface-variant/60" />
                    )}
                    <span className="text-xs font-bold tracking-wide uppercase transition-colors">
                        {playing ? (
                            <span className="text-m3-primary">Now Playing</span>
                        ) : (
                            <span className="text-m3-on-surface-variant">Audio Preview</span>
                        )}
                    </span>
                </div>

                <span className="text-[11px] font-semibold text-m3-outline bg-m3-surface-container px-2.5 py-0.5 rounded-full border border-m3-outline-variant/30">
                    High Quality BGM
                </span>
            </div>

            {/* Scrubber Progress Slider */}
            <div className="space-y-1.5 my-2">
                <div
                    ref={trackRef}
                    onClick={handleTrackClick}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className="group relative h-7 flex items-center cursor-pointer touch-none select-none py-2"
                    role="slider"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(activeProgress)}
                    aria-label="Audio scrubber"
                >
                    {/* Background Track */}
                    <div className="w-full h-2 rounded-full bg-m3-surface-container-highest overflow-hidden transition-all group-hover:h-2.5">
                        {/* Progress Fill */}
                        <div
                            className="h-full bg-m3-primary rounded-full transition-all duration-75 ease-out"
                            style={{ width: `${Math.min(100, Math.max(0, activeProgress))}%` }}
                        />
                    </div>

                    {/* Draggable Thumb Knob */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-m3-primary border-2 border-white shadow-md transition-transform duration-75 group-hover:scale-125"
                        style={{ left: `${Math.min(100, Math.max(0, activeProgress))}%` }}
                    />
                </div>

                {/* Timestamps */}
                <div className="flex items-center justify-between text-[11px] font-mono font-medium text-m3-on-surface-variant px-0.5">
                    <span>{formatSeconds(currentTime)}</span>
                    <span>{formatSeconds(totalDuration)}</span>
                </div>
            </div>

            {/* Playback Controls Row */}
            <div className="flex items-center justify-center gap-6 mt-1">
                {/* Skip -5s */}
                <button
                    type="button"
                    onClick={() => handleSkip(-5)}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container transition-all active:scale-90 cursor-pointer"
                    aria-label="Skip backward 5 seconds"
                    title="Rewind 5s"
                >
                    <RotateCcw size={18} />
                </button>

                {/* Central Primary Play/Pause FAB */}
                <button
                    type="button"
                    onClick={handlePlayToggle}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 shadow-md hover:shadow-lg ${
                        playing
                            ? 'bg-m3-primary text-m3-on-primary ring-4 ring-m3-primary/20'
                            : 'bg-m3-primary text-m3-on-primary hover:bg-m3-primary/90'
                    }`}
                    aria-label={playing ? `Pause ${ringtone.title}` : `Play ${ringtone.title}`}
                >
                    {playing ? (
                        <Pause size={24} fill="currentColor" />
                    ) : (
                        <Play size={24} fill="currentColor" className="ml-1" />
                    )}
                </button>

                {/* Skip +5s */}
                <button
                    type="button"
                    onClick={() => handleSkip(5)}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container transition-all active:scale-90 cursor-pointer"
                    aria-label="Skip forward 5 seconds"
                    title="Forward 5s"
                >
                    <RotateCw size={18} />
                </button>
            </div>
        </div>
    );
}
