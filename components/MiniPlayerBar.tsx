'use client';

import { usePlayerProgress } from '@/context/PlayerContext';

interface MiniPlayerBarProps {
    loadedDuration: number | null;
}

export default function MiniPlayerBar({ loadedDuration }: MiniPlayerBarProps) {
    const { progress, duration } = usePlayerProgress();

    const effectiveDuration = duration > 0 ? duration : (loadedDuration || 30);
    const currentTime = Math.min(effectiveDuration, Math.floor((progress / 100) * effectiveDuration));

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-2 w-full animate-in fade-in duration-200 py-0.5">
            {/* Animated 4-Bar Micro Equalizer */}
            <div className="flex items-end gap-0.5 h-3 px-1 py-0.5 rounded bg-m3-primary/10 shrink-0">
                <span className="w-0.5 bg-m3-primary rounded-full animate-music-bar-1" />
                <span className="w-0.5 bg-m3-primary rounded-full animate-music-bar-2" />
                <span className="w-0.5 bg-m3-primary rounded-full animate-music-bar-3" />
                <span className="w-0.5 bg-m3-primary rounded-full animate-music-bar-1" />
            </div>

            {/* Hairline 2px Progress Track */}
            <div className="flex-1 max-w-[120px] sm:max-w-[160px] h-1 rounded-full bg-m3-outline-variant/30 overflow-hidden">
                <div
                    className="h-full bg-m3-primary rounded-full transition-all duration-150 ease-linear"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
            </div>

            {/* Timestamp */}
            <span className="text-[10px] font-semibold text-m3-primary tracking-tight shrink-0 font-mono">
                {formatTime(currentTime)} / {formatTime(effectiveDuration)}
            </span>
        </div>
    );
}

