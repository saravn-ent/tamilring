'use client';

import React, { useRef, useState, useMemo, useCallback } from 'react';
import { throttledScrubHaptic, hapticFeedback, hapticPatterns } from '@/lib/haptics';

interface WaveformScrubberProps {
    progress: number; // 0 to 100
    duration: number; // in seconds
    onSeek: (time: number) => void;
    isPlaying?: boolean;
    barCount?: number;
    height?: 'sm' | 'md' | 'lg';
    seed?: string | number;
    interactive?: boolean;
    className?: string;
    showTimeBadge?: boolean;
}

export default function WaveformScrubber({
    progress,
    duration,
    onSeek,
    isPlaying = false,
    barCount = 32,
    height = 'md',
    seed,
    interactive = true,
    className = '',
    showTimeBadge = false,
}: WaveformScrubberProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [hoverProgress, setHoverProgress] = useState<number | null>(null);

    // Generate pseudo-random organic waveform bars seeded by string or default pattern
    const bars = useMemo(() => {
        let hash = 42;
        if (seed) {
            const str = String(seed);
            for (let i = 0; i < str.length; i++) {
                hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
            }
        }

        const pseudoRandom = (index: number) => {
            const x = Math.sin(hash + index * 12.9898) * 43758.5453;
            return x - Math.floor(x);
        };

        const result: number[] = [];
        for (let i = 0; i < barCount; i++) {
            // Natural audio curve envelope: rising intro, dynamic peaks, punchy chorus, gentle tail
            const positionRatio = i / barCount;
            const envelope = Math.sin(positionRatio * Math.PI) * 0.4 + 0.6;
            const randomVariation = pseudoRandom(i) * 0.5 + 0.5;
            const normalizedHeight = Math.max(0.2, Math.min(1.0, envelope * randomVariation));
            result.push(normalizedHeight);
        }
        return result;
    }, [barCount, seed]);

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const calculatePercentage = useCallback((clientX: number) => {
        if (!containerRef.current) return 0;
        const rect = containerRef.current.getBoundingClientRect();
        const offsetX = clientX - rect.left;
        const raw = (offsetX / rect.width) * 100;
        return Math.max(0, Math.min(100, raw));
    }, []);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!interactive || !duration) return;
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        setIsDragging(true);

        hapticFeedback(hapticPatterns.impact);
        const pct = calculatePercentage(e.clientX);
        setHoverProgress(pct);
        onSeek((pct / 100) * duration);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!interactive) return;
        const pct = calculatePercentage(e.clientX);

        if (isDragging) {
            throttledScrubHaptic(50);
            setHoverProgress(pct);
            if (duration) {
                onSeek((pct / 100) * duration);
            }
        }
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        setIsDragging(false);
        setHoverProgress(null);
        hapticFeedback(hapticPatterns.selection);
        try {
            e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
            // Already released
        }
    };

    const heightClass = {
        sm: 'h-6',
        md: 'h-9',
        lg: 'h-14',
    }[height];

    const activePercent = isDragging && hoverProgress !== null ? hoverProgress : progress;
    const currentTime = (activePercent / 100) * (duration || 0);

    return (
        <div className={`relative flex flex-col w-full select-none ${className}`}>
            {/* Scrubber Container */}
            <div
                ref={containerRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                role="slider"
                aria-label="Waveform Audio Progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(activePercent)}
                tabIndex={interactive ? 0 : -1}
                className={`relative w-full ${heightClass} flex items-center justify-between gap-0.5 sm:gap-1 px-1 py-1 rounded-xl transition-colors ${
                    interactive ? 'cursor-pointer hover:bg-m3-surface-container/60 active:bg-m3-surface-container' : ''
                }`}
                style={{ touchAction: 'none' }}
            >
                {/* Floating Thumb Drag Tooltip */}
                {isDragging && (
                    <div
                        className="absolute -top-8 px-2 py-0.5 rounded-md bg-m3-inverse-surface text-m3-inverse-on-surface text-[11px] font-bold shadow-md pointer-events-none transform -translate-x-1/2 transition-transform duration-75 z-20 flex items-center gap-1"
                        style={{ left: `${activePercent}%` }}
                    >
                        <span>{formatTime(currentTime)}</span>
                        <span className="opacity-60">/</span>
                        <span className="opacity-80">{formatTime(duration)}</span>
                    </div>
                )}

                {/* Waveform Bars */}
                {bars.map((barHeight, idx) => {
                    const barPercent = (idx / (bars.length - 1)) * 100;
                    const isPlayed = barPercent <= activePercent;
                    const isNearPlayhead = Math.abs(barPercent - activePercent) < (100 / bars.length) * 1.5;

                    return (
                        <div
                            key={idx}
                            className="flex-1 flex items-center justify-center h-full min-w-[2px] max-w-[5px]"
                        >
                            <span
                                className={`w-full rounded-full transition-all duration-150 ${
                                    isPlayed
                                        ? 'bg-m3-primary shadow-2xs'
                                        : 'bg-m3-outline-variant/60 hover:bg-m3-outline/70'
                                } ${
                                    isPlaying && isNearPlayhead
                                        ? 'scale-y-125 brightness-110 animate-pulse'
                                        : ''
                                } ${
                                    isDragging && isNearPlayhead
                                        ? 'scale-y-130 bg-m3-primary'
                                        : ''
                                }`}
                                style={{
                                    height: `${Math.round(barHeight * 100)}%`,
                                    transition: isDragging ? 'none' : 'height 0.2s ease, background-color 0.15s ease',
                                }}
                            />
                        </div>
                    );
                })}

                {/* Glowing Active Playhead Indicator */}
                <div
                    className={`absolute top-0 bottom-0 w-0.5 bg-m3-primary rounded-full shadow-[0_0_8px_rgba(215,25,60,0.8)] pointer-events-none transition-all ${
                        isDragging ? 'opacity-100 scale-y-110' : 'opacity-80'
                    }`}
                    style={{
                        left: `${activePercent}%`,
                        transition: isDragging ? 'none' : 'left 0.1s linear',
                    }}
                />
            </div>

            {/* Optional Timestamps Row */}
            {showTimeBadge && (
                <div className="flex items-center justify-between text-[11px] font-semibold text-m3-outline px-1 mt-0.5">
                    <span className="tabular-nums font-mono text-m3-on-surface-variant">
                        {formatTime(currentTime)}
                    </span>
                    <span className="tabular-nums font-mono">
                        {formatTime(duration)}
                    </span>
                </div>
            )}
        </div>
    );
}
