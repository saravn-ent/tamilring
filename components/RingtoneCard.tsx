'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Pause, Heart, ArrowRight, Share2 } from 'lucide-react';
import { Ringtone } from '@/types';
import { usePlayer } from '@/context/PlayerContext';
import { incrementLikes } from '@/app/actions';

interface RingtoneCardProps {
  ringtone: Ringtone;
}

export default function RingtoneCard({ ringtone }: RingtoneCardProps) {
  const { currentRingtone, isPlaying, playRingtone, togglePlay, progress } = usePlayer();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(ringtone.likes || 0);

  const isCurrent = currentRingtone?.id === ringtone.id;
  const isActive = isCurrent && isPlaying;

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isActive) {
      togglePlay();
    } else {
      playRingtone(ringtone);
    }
  };



  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isLiked) {
      setLikesCount(prev => prev + 1);
      setIsLiked(true);
      await incrementLikes(ringtone.id);
    } else {
      setLikesCount(prev => prev - 1);
      setIsLiked(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareUrl = `${window.location.origin}/ringtone/${ringtone.slug}`;
    const shareData = {
        title: `${ringtone.title} Ringtone`,
        text: `Listen to ${ringtone.title} on TamilRing`,
        url: shareUrl,
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            await navigator.clipboard.writeText(shareUrl);
            // Optional: You could add a toast notification here
        }
    } catch (err) {
        console.error('Error sharing:', err);
    }
  };

  return (
    <Link href={`/ringtone/${ringtone.slug}`} className="group block h-full">
      <div className="relative h-full bg-white/80 dark:bg-neutral-900/40 backdrop-blur-md border border-zinc-200 dark:border-white/5 rounded-3xl p-3 transition-all duration-300 hover:bg-white dark:hover:bg-neutral-800/60 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 overflow-hidden">
        
        {/* Glass Reflection Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="flex items-center gap-4">
            {/* Album Art */}
            <div className="relative w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg bg-zinc-200 dark:bg-neutral-800">
                <Image
                    src={ringtone.poster_url || '/placeholder-cover.jpg'}
                    alt={ringtone.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Play Button Overlay */}
                <button
                  onClick={handlePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/8 transition-all duration-300"
                  aria-label={isActive ? 'Pause' : 'Play'}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-lg transition-all duration-300 ${isActive ? 'bg-rose-500 text-white scale-110' : 'bg-white/30 text-white hover:bg-white/50 hover:scale-105'}`}>
                    {isActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
                  </div>
                </button>
            </div>

            {/* Info & Actions */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
                <div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-white truncate leading-tight">
                        {ringtone.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-neutral-400 truncate mt-0.5">
                        {ringtone.movie_name}
                    </p>
                </div>

                {/* Progress Bar */}
                {isActive && (
                  <div className="w-full h-1 bg-zinc-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-rose-500 transition-all duration-100 ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                {/* Tags + Action Buttons Row */}
                <div className="flex items-start justify-between w-full mt-2">
                    <div className="flex-1 flex flex-wrap gap-2"> 
                      {ringtone.tags && ringtone.tags.length > 0 ? (
                        ringtone.tags.slice(0, 5).map((tag: string) => (
                          <span
                            key={tag}
                            className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-neutral-300 truncate"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <div className="text-xs text-zinc-400 dark:text-neutral-500">&nbsp;</div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-3">
                      <button
                          onClick={handleLike}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                            isLiked
                              ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                              : 'bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-neutral-400 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/10'
                          }`}
                        >
                          <Heart size={12} className={isLiked ? 'fill-current' : ''} />
                          <span>{likesCount}</span>
                        </button>

                        <div
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-neutral-400 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/10 transition-all duration-200"
                        >
                          <ArrowRight size={14} />
                          <span>{ringtone.downloads || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </Link>
  );
}
