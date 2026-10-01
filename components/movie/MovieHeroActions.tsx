'use client';

import React, { useState } from 'react';
import { Play, Pause, Share2, Check } from 'lucide-react';
import { Ringtone } from '@/types';
import { usePlayer } from '@/context/PlayerContext';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';

interface MovieHeroActionsProps {
    firstRingtone: Ringtone;
    movieName: string;
}

export default function MovieHeroActions({ firstRingtone, movieName }: MovieHeroActionsProps) {
    const { currentRingtone, isPlaying, playRingtone, togglePlay } = usePlayer();

    const isThisMovieActive = 
        currentRingtone && 
        (currentRingtone.movie_name?.toLowerCase() === movieName.toLowerCase() || 
         currentRingtone.id === firstRingtone.id);

    const isCurrentPlaying = isThisMovieActive && isPlaying;

    const handlePlayAlbum = () => {
        hapticFeedback(hapticPatterns.impact);
        if (isThisMovieActive) {
            togglePlay();
        } else {
            playRingtone(firstRingtone, 'movie_album');
        }
    };

    return (
        <div className="flex items-center gap-2 pt-0.5">
            {/* Primary Play Album CTA */}
            <button
                type="button"
                onClick={handlePlayAlbum}
                className="inline-flex items-center gap-1.5 h-8 sm:h-9 px-3.5 sm:px-4 rounded-full bg-m3-primary hover:bg-m3-primary/90 text-m3-on-primary font-bold text-xs shadow-xs hover:shadow active:scale-95 transition-all cursor-pointer"
                aria-label={isCurrentPlaying ? `Pause ${movieName} Album` : `Play ${movieName} Album`}
            >
                {isCurrentPlaying ? (
                    <>
                        <Pause size={14} fill="currentColor" />
                        <span>Pause Track</span>
                    </>
                ) : (
                    <>
                        <Play size={14} fill="currentColor" className="ml-0.5" />
                        <span>Play Top Track</span>
                    </>
                )}
            </button>
        </div>
    );
}

export function ShareAlbumButton({ movieName }: { movieName: string }) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        hapticFeedback(hapticPatterns.selection);
        const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
        const shareData = {
            title: `${movieName} Ringtones & BGM`,
            text: `Download the best Tamil ringtones and BGM from ${movieName} on TamilRing!`,
            url: shareUrl,
        };

        try {
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (err) {
            // Sharing cancelled
        }
    };

    return (
        <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center justify-center w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md shadow-xs text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            aria-label="Share Album"
            title="Share Album"
        >
            {copied ? (
                <Check size={15} className="text-emerald-400" />
            ) : (
                <Share2 size={15} className="text-white" />
            )}
        </button>
    );
}
