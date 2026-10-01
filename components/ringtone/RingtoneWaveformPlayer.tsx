'use client';

import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2 } from 'lucide-react';
import { Ringtone } from '@/types';
import { usePlayer, usePlayerProgress } from '@/context/PlayerContext';
import { hapticFeedback, hapticPatterns, throttledScrubHaptic } from '@/lib/haptics';

interface RingtoneWaveformPlayerProps {
    ringtone: Ringtone;
}

const TOTAL_BARS = 36;

/**
 * Deterministically generates an array of 36 waveform bar heights (0.2 to 1.0)
 * based on the ringtone title and duration, creating a consistent visual audio fingerprint.
 */
function generateWaveformBars(seedStr: string): number[] {
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
        hash = (hash << 5) - hash + seedStr.charCodeAt(i);
        hash |= 0;
    }

    const bars: number[] = [];
    for (let i = 0; i < TOTAL_BARS; i++) {
        // Pseudo-random wave with natural musical envelope (intro -> crescendo -> climax -> outro)
        const pseudoRandom = Math.abs(Math.sin((hash + i * 17) * 0.25));
        const envelope = Math.sin((i / (TOTAL_BARS - 1)) * Math.PI); // arch envelope
        const height = Math.min(1.0, Math.max(0.18, (pseudoRandom * 0.65 + envelope * 0.45)));
        bars.push(Math.round(height * 100) / 100);
    }
    return bars;
}

export default function RingtoneWaveformPlayer({ ringtone }: RingtoneWaveformPlayerProps) {
    const { currentRingtone, isPlaying, playRingtone, togglePlay } = usePlayer();
    const { progress, duration, seek } = usePlayerProgress();

    const isCurrent = currentRingtone?.id === ringtone.id;
    const isActive = isCurrent && isPlaying;

    const [isDragging, setIsDragging] = useState(false);
    const [dragProgress, setDragProgress] = useState<number | null>(null);
    const waveformRef = useRef<HTMLDivElement>(null);

    // Compute effective duration
    const effectiveDuration = duration > 0 ? duration : (ringtone.duration || 30);
    const displayProgress = isDragging && dragProgress !== null ? dragProgress : (isCurrent ? progress : 0);
    const currentTime = Math.min(effectiveDuration, Math.floor((displayProgress / 100) * effectiveDuration));

    // Memoize waveform pattern for stable rendering
    const waveformBars = useMemo(
        () => generateWaveformBars(`${ringtone.title}_${ringtone.id}_${effectiveDuration}`),
        [ringtone.title, ringtone.id, effectiveDuration]
    );

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleTogglePlay = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        hapticFeedback(hapticPatterns.impact);

        if (isCurrent) {
            togglePlay();
        } else {
            playRingtone(ringtone);
        }
    };

    const seekToFraction = useCallback((fraction: number) => {
        const clampedFraction = Math.max(0, Math.min(1, fraction));
        const targetTime = clampedFraction * effectiveDuration;
        seek(targetTime);
        throttledScrubHaptic();
    }, [effectiveDuration, seek]);

    const calculateFractionFromEvent = (clientX: number): number => {
        if (!waveformRef.current) return 0;
        const rect = waveformRef.current.getBoundingClientRect();
        return (clientX - rect.left) / rect.width;
    };

    // Pointer Scrubbing (Mouse & Touch)
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isCurrent) {
            playRingtone(ringtone);
        }

        setIsDragging(true);
        const fraction = calculateFractionFromEvent(e.clientX);
        const newPct = Math.max(0, Math.min(100, fraction * 100));
        setDragProgress(newPct);
        seekToFraction(fraction);

        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        const fraction = calculateFractionFromEvent(e.clientX);
        const newPct = Math.max(0, Math.min(100, fraction * 100));
        setDragProgress(newPct);
        seekToFraction(fraction);
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (isDragging) {
            setIsDragging(false);
            const fraction = calculateFractionFromEvent(e.clientX);
            seekToFraction(fraction);
            setDragProgress(null);
            hapticFeedback(hapticPatterns.selection);
        }
    };

    const handleSkip = (seconds: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        hapticFeedback(hapticPatterns.selection);

        if (!isCurrent) {
            playRingtone(ringtone);
            return;
        }

        const newTime = Math.max(0, Math.min(effectiveDuration, currentTime + seconds));
        seek(newTime);
    };

    const activeBarIndex = Math.floor((displayProgress / 100) * TOTAL_BARS);

    return (
        <div className="w-full bg-m3-surface-container-low border border-m3-outline-variant/40 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-sm transition-all duration-300">
            {/* 1. Header: Status Pill & Quality Spec */}
            <div className="flex items-center justify-between text-xs mb-2.5 px-0.5">
                <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-ping' : 'bg-m3-outline/60'}`} />
                    <span className="font-bold text-[11px] text-m3-on-surface">
                        {isActive ? 'Now Playing' : isCurrent ? 'Paused' : 'Ringtone Preview'}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-bold text-m3-on-surface-variant bg-m3-surface-container px-2.5 py-0.5 rounded-full border border-m3-outline-variant/50">
                    <Volume2 size={12} className="text-m3-primary" />
                    <span>320kbps Studio Cut</span>
                </div>
            </div>

            {/* 2. Interactive Audio Waveform Canvas */}
            <div
                ref={waveformRef}
                role="slider"
                aria-label="Seek ringtone preview"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(displayProgress)}
                tabIndex={0}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="group/waveform relative w-full h-14 sm:h-16 flex items-center justify-between gap-1 sm:gap-1.5 px-2 py-1.5 rounded-xl bg-m3-surface-container/60 hover:bg-m3-surface-container border border-m3-outline-variant/30 cursor-pointer select-none touch-none transition-colors"
                title="Click or drag to scrub"
            >
                {/* Waveform Frequency Bars */}
                {waveformBars.map((heightMultiplier, idx) => {
                    const isPassed = idx <= activeBarIndex;
                    const isNearPlayhead = isActive && Math.abs(idx - activeBarIndex) <= 1;

                    return (
                        <div
                            key={idx}
                            className="relative flex-1 h-full flex items-center justify-center pointer-events-none"
                        >
                            <span
                                className={`w-full max-w-[5px] sm:max-w-[7px] rounded-full transition-all duration-150 ${
                                    isPassed
                                        ? 'bg-gradient-to-t from-m3-primary via-rose-500 to-amber-400 shadow-2xs'
                                        : 'bg-m3-outline-variant/40 group-hover/waveform:bg-m3-outline-variant/60'
                                } ${isNearPlayhead ? 'scale-y-115' : ''}`}
                                style={{
                                    height: `${Math.round(heightMultiplier * 100)}%`,
                                }}
                            />
                        </div>
                    );
                })}

                {/* Scrubber Playhead Line */}
                <div
                    className="absolute top-0 bottom-0 w-0.5 bg-m3-primary shadow-md pointer-events-none transition-all duration-75"
                    style={{ left: `${Math.min(99.5, Math.max(0.5, displayProgress))}%` }}
                >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-m3-primary shadow-sm" />
                </div>
            </div>

            {/* 3. Transport Controls & Live Timestamps Row */}
            <div className="flex items-center justify-between mt-3 px-1">
                {/* Current Elapsed Time */}
                <span className="font-mono text-xs sm:text-sm font-extrabold text-m3-primary tabular-nums min-w-[36px]">
                    {formatTime(currentTime)}
                </span>

                {/* Symmetrical Transport Controls */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* -5s Skip */}
                    <button
                        type="button"
                        onClick={(e) => handleSkip(-5, e)}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-m3-on-surface hover:text-m3-primary hover:bg-m3-surface-container active:scale-90 transition-all cursor-pointer"
                        title="Rewind 5 seconds"
                        aria-label="Rewind 5 seconds"
                    >
                        <RotateCcw size={16} />
                    </button>

                    {/* Primary Play/Pause Centerpiece Disc */}
                    <button
                        type="button"
                        onClick={handleTogglePlay}
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer shadow-md shrink-0 ${
                            isActive
                                ? 'bg-m3-primary text-m3-on-primary ring-4 ring-m3-primary/25 scale-105 shadow-m3-primary/30'
                                : 'bg-m3-primary text-m3-on-primary hover:bg-m3-primary/90 hover:scale-105 shadow-m3-primary/20'
                        }`}
                        title={isActive ? 'Pause Preview' : 'Play Preview'}
                        aria-label={isActive ? 'Pause preview' : 'Play preview'}
                    >
                        {isActive ? (
                            <Pause size={19} fill="currentColor" />
                        ) : (
                            <Play size={19} fill="currentColor" className="ml-0.5" />
                        )}
                    </button>

                    {/* +5s Skip */}
                    <button
                        type="button"
                        onClick={(e) => handleSkip(5, e)}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-m3-on-surface hover:text-m3-primary hover:bg-m3-surface-container active:scale-90 transition-all cursor-pointer"
                        title="Skip 5 seconds forward"
                        aria-label="Skip 5 seconds forward"
                    >
                        <RotateCw size={16} />
                    </button>
                </div>

                {/* Total Duration */}
                <span className="font-mono text-xs sm:text-sm font-bold text-m3-on-surface-variant tabular-nums min-w-[36px] text-right">
                    {formatTime(effectiveDuration)}
                </span>
            </div>
        </div>
    );
}
