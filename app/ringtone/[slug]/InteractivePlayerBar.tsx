'use client';

import { usePlayer } from '@/context/PlayerContext';
import { Ringtone } from '@/types';
import { Play, Pause } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

export default function InteractivePlayerBar({ ringtone }: { ringtone: Ringtone }) {
    const { currentRingtone, isPlaying, progress, duration, playRingtone, seek } = usePlayer();
    const isCurrent = currentRingtone?.id === ringtone.id;
    const playing = isCurrent && isPlaying;
    const progressBarRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const currentTime = isCurrent ? (duration * progress) / 100 : 0;

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressBarRef.current || !isCurrent) return;

        const rect = progressBarRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = (clickX / rect.width) * 100;
        const newTime = (percentage / 100) * duration;

        seek(newTime);
    };

    const handleProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !progressBarRef.current || !isCurrent) return;

        const rect = progressBarRef.current.getBoundingClientRect();
        const dragX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (dragX / rect.width) * 100));
        const newTime = (percentage / 100) * duration;

        seek(newTime);
    };

    return (
        <div className="w-full space-y-4">
            {/* Play/Pause Button with Circular Progress */}
            <div className="flex items-center justify-center">
                <button
                    onClick={() => playRingtone(ringtone)}
                    className="relative w-20 h-20 rounded-full bg-emerald-500 hover:bg-emerald-400 transition-all flex items-center justify-center shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95"
                >
                    {/* Circular Progress Ring */}
                    {isCurrent && (
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="46"
                                fill="none"
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="3"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="46"
                                fill="none"
                                stroke="white"
                                strokeWidth="3"
                                strokeDasharray={`${2 * Math.PI * 46}`}
                                strokeDashoffset={`${2 * Math.PI * 46 * (1 - progress / 100)}`}
                                strokeLinecap="round"
                                className="transition-all duration-100"
                            />
                        </svg>
                    )}

                    {/* Play/Pause Icon */}
                    <div className="relative z-10 text-neutral-900">
                        {playing ? (
                            <Pause size={32} fill="currentColor" />
                        ) : (
                            <Play size={32} fill="currentColor" className="ml-1" />
                        )}
                    </div>
                </button>
            </div>

            {/* Linear Progress Bar */}
            <div className="space-y-2">
                <div
                    ref={progressBarRef}
                    onClick={handleProgressClick}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseLeave={() => setIsDragging(false)}
                    onMouseMove={handleProgressDrag}
                    className="relative h-2 bg-neutral-800 rounded-full cursor-pointer overflow-hidden group"
                >
                    {/* Progress Fill */}
                    <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-100"
                        style={{ width: isCurrent ? `${progress}%` : '0%' }}
                    />

                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Seek Handle */}
                    {isCurrent && progress > 0 && (
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ left: `calc(${progress}% - 8px)` }}
                        />
                    )}
                </div>

                {/* Time Display */}
                <div className="flex justify-between text-xs text-zinc-500 font-medium">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    );
}
