'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause } from 'lucide-react';
import TMDBImage from '@/components/TMDBImage';
import { Ringtone } from '@/types';
import { usePlayer } from '@/context/PlayerContext';
import { hapticFeedback } from '@/lib/haptics';

interface NostalgiaListProps {
    nostalgia: Ringtone[];
}

export default function NostalgiaList({ nostalgia }: NostalgiaListProps) {
    const { currentRingtone, isPlaying, playRingtone, togglePlay } = usePlayer();
    const router = useRouter();

    const handlePlay = (e: React.MouseEvent, ringtone: Ringtone) => {
        e.preventDefault();
        e.stopPropagation();
        hapticFeedback(25);

        // Use standard sync toggle if already current, but yield for play
        if (currentRingtone?.id === ringtone.id) {
            togglePlay();
        } else {
            setTimeout(() => {
                playRingtone(ringtone);
            }, 0);
        }
    };

    const handleCardClick = (slug: string) => {
        router.push(`/ringtone/${slug}`);
    };

    return (
        <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 md:overflow-visible">
            {nostalgia.map((ringtone: Ringtone) => {
                const isCurrent = currentRingtone?.id === ringtone.id;
                const isActive = isCurrent && isPlaying;

                return (
                    <div
                        key={ringtone.id}
                        onClick={() => handleCardClick(ringtone.slug)}
                        className="snap-start shrink-0 w-32 sm:w-36 md:w-full group cursor-pointer"
                    >
                        <div className="relative w-32 sm:w-36 md:w-full h-44 sm:h-48 md:h-auto md:aspect-[2/3] rounded-xl overflow-hidden mb-2 bg-brand-wash shadow-lg group-hover:shadow-brand-accent/20 transition-all border border-brand-border/50 active:scale-95">
                            <TMDBImage
                                path={ringtone.poster_url}
                                alt={ringtone.title}
                                fill
                                sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 16vw"
                                quality={75}
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />

                            {/* Overlay Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-90'}`} />

                            {/* Year Badge */}
                            <div className="absolute top-2 left-2 bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-white font-medium backdrop-blur-sm z-20">
                                {ringtone.movie_year}
                            </div>

                            {/* Playing Indicator (Top Right) */}
                            {isActive && (
                                <div className="absolute top-2 right-2 flex gap-0.5 items-end h-3 z-20">
                                    <div className="w-1 bg-brand-accent rounded-full animate-music-bar-1" />
                                    <div className="w-1 bg-brand-accent rounded-full animate-music-bar-2" />
                                    <div className="w-1 bg-brand-accent rounded-full animate-music-bar-3" />
                                </div>
                            )}

                            {/* Play Button - Bottom Right Corner */}
                            <div className="absolute bottom-3 right-3 z-30">
                                <button
                                    type="button"
                                    onClick={(e) => handlePlay(e, ringtone)}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-90 pointer-events-auto ${isActive ? 'bg-brand-accent text-white scale-110' : 'bg-white/20 text-white hover:bg-white/40'}`}
                                >
                                    {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-0.5" />}
                                </button>
                            </div>
                        </div>
                        <p className="text-xs font-bold text-black truncate group-hover:text-brand-accent transition-colors">{ringtone.title}</p>
                        <p className="text-[10px] text-brand-dark truncate">{ringtone.movie_name}</p>
                        {ringtone.profile?.full_name && (
                            <p className="text-[9px] text-zinc-500 truncate mt-0.5">by {ringtone.profile.full_name}</p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
