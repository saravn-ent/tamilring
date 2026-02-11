'use client';

import { usePlayerProgress } from '@/context/PlayerContext';

interface MiniPlayerBarProps {
    loadedDuration: number | null;
}

export default function MiniPlayerBar({ loadedDuration }: MiniPlayerBarProps) {
    const { progress } = usePlayerProgress();

    const formatDuration = (seconds: number | null) => {
        if (!seconds || isNaN(seconds)) return '';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="mt-2.5 mb-1.5 flex flex-col w-full animate-in fade-in slide-in-from-top-1">
            <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-brand-accent transition-all duration-100 ease-linear rounded-full"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="w-full flex items-center justify-end text-[10px] font-black text-brand-accent mt-1.5 px-0.5">
                <span className="bg-brand-wash px-1 rounded">
                    {formatDuration((progress / 100) * (loadedDuration || 0))} / {formatDuration(loadedDuration)}
                </span>
            </div>
        </div>
    );
}
