'use client';
// Force HMR Update - Fix missing Download module error
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Pause, Heart, Share2, Plus, Music } from 'lucide-react';
import { Ringtone } from '@/types';
import { usePlayer } from '@/context/PlayerContext';
import { incrementLikes } from '@/app/actions/ringtones';
import { getImageUrl } from '@/lib/tmdb';

import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const AddToCollectionModal = dynamic(() => import('./AddToCollectionModal'), { ssr: false });

interface RingtoneCardProps {
  ringtone: Ringtone;
  assignTo?: string;
}

export default function RingtoneCard({ ringtone, assignTo }: RingtoneCardProps) {
  const { currentRingtone, isPlaying, playRingtone, togglePlay, progress } = usePlayer();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(ringtone.likes || 0);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  const isCurrent = currentRingtone?.id === ringtone.id;
  const isActive = isCurrent && isPlaying;

  // Force HMR Update
  useEffect(() => {
    // console.log('RingtoneCard Mounted - v2');
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          togglePlay();
        }
      },
      { threshold: 0 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [isActive, togglePlay]);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Antigravity Fix: Yield to main thread to prioritize UI response (INP)
    setTimeout(() => {
      if (isActive) {
        togglePlay();
      } else {
        playRingtone(ringtone);
      }
    }, 0);
  };

  const handleAssign = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (assignTo) {
      const saved = localStorage.getItem('user_collections');
      if (saved) {
        const collections = JSON.parse(saved);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updated = collections.map((c: any) => {
          if (c.id === assignTo) return { ...c, ringtone };
          return c;
        });
        localStorage.setItem('user_collections', JSON.stringify(updated));
        router.push('/profile');
      }
    }
  };

  const handleOpenAssignModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAssignModal(true);
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
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  // Aggressively clean the title since we show movie name separately
  const safeMovieName = ringtone.movie_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  let displayName = ringtone.title
    .replace(/\(From ".*?"\)/i, '') // Remove (From "Movie")
    .replace(new RegExp(`\\s*[-|]?\\s*${safeMovieName}\\s*[-|]?\\s*`, 'i'), '') // Remove Movie Name if present w/ separators
    .replace(/-+$/, '') // Remove trailing hyphens
    .trim();

  // Fallback: If cleaning removed everything (rare edge case), show original
  if (!displayName) displayName = ringtone.title;

  return (
    <>
      <div
        ref={cardRef}
        className="group relative bg-white border border-zinc-200 rounded-xl p-3 transition-all duration-200 hover:border-zinc-300 hover:shadow-md"
      >
        <div className="flex items-center gap-4">

          {/* 1. Album Art + Play Button */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-100">
            <Link href={`/ringtone/${ringtone.slug}`} className="block w-full h-full relative">
              {ringtone.poster_url ? (
                <Image
                  src={getImageUrl(ringtone.poster_url)}
                  alt={ringtone.title}
                  fill
                  sizes="(max-width: 640px) 25vw, 80px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-300">
                  <Music size={24} />
                </div>
              )}
            </Link>

            {/* Play Button Overlay */}
            <button
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors z-10"
              aria-label={isActive ? 'Pause' : 'Play'}
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm backdrop-blur-sm transition-all duration-200 ${isActive ? 'bg-brand-accent text-white scale-110' : 'bg-white text-zinc-900 hover:scale-110'}`}>
                {isActive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
              </div>
            </button>
          </div>

          {/* 2. Content Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
            <Link href={`/ringtone/${ringtone.slug}`} className="block group/title">
              <h3 className="text-[15px] sm:text-base font-bold text-zinc-900 truncate leading-tight group-hover/title:text-brand-accent transition-colors">
                {displayName}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 truncate font-medium">
                {ringtone.movie_name}
              </p>
            </Link>

            {/* Tags */}
            {ringtone.tags && ringtone.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {ringtone.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10px] px-1.5 py-px rounded-md bg-zinc-50 text-zinc-500 border border-zinc-100 truncate max-w-[80px]">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Progress or Stats */}
            {isActive ? (
              <div className="max-w-[140px] w-full h-1 bg-zinc-100 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-brand-accent transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1 text-[10px] sm:text-xs font-medium text-zinc-400">
                <span>
                  {ringtone.downloads > 0 ? (ringtone.downloads > 1000 ? `${(ringtone.downloads / 1000).toFixed(1)}k` : ringtone.downloads) : 0} Downloads
                </span>
                <span className="text-zinc-300">•</span>
                <span>
                  {likesCount > 0 ? (likesCount > 1000 ? `${(likesCount / 1000).toFixed(1)}k` : likesCount) : 0} Likes
                </span>
              </div>
            )}
          </div>

          {/* 3. Actions (Right Side) */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 pl-2">

            {/* Like (Mobile: Top, Desktop: Row) */}
            <button
              onClick={handleLike}
              className={`p-2 rounded-full transition-colors ${isLiked ? 'text-rose-500 bg-rose-50' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'
                }`}
            >
              <Heart size={18} className={isLiked ? 'fill-current' : ''} />
            </button>

            {/* Download / Assign Main Action */}
            {/* Download / Assign Main Action */}
            {assignTo && (
              <button
                onClick={handleAssign}
                className="px-4 py-1.5 bg-brand-accent text-white text-xs font-bold rounded-full hover:bg-brand-accent/90"
              >
                Assign
              </button>
            )}

            {/* Share (Desktop only usually, or keep compact) */}
            <button
              onClick={handleShare}
              className="hidden sm:flex p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 rounded-full transition-colors"
            >
              <Share2 size={18} />
            </button>

            {/* Add to collection (if not assigning) */}
            {!assignTo && (
              <button
                onClick={handleOpenAssignModal}
                className="hidden sm:flex p-2 text-zinc-400 hover:text-brand-accent hover:bg-brand-accent/5 rounded-full"
                title="Add to Collection"
              >
                <Plus size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <AddToCollectionModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        ringtone={ringtone}
      />
    </>
  );
}
