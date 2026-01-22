'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Pause, Heart, Share2, Music, Download } from 'lucide-react';
import { Ringtone } from '@/types';
import { usePlayer } from '@/context/PlayerContext';
import { incrementLikes } from '@/app/actions/ringtones';
import { getImageUrl } from '@/lib/tmdb';

import { useRouter } from 'next/navigation';




interface RingtoneCardProps {
  ringtone: Ringtone;
  assignTo?: string;
}

export default function RingtoneCard({ ringtone, assignTo }: RingtoneCardProps) {
  const { currentRingtone, isPlaying, playRingtone, togglePlay, progress } = usePlayer();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(ringtone.likes || 0);


  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  const isCurrent = currentRingtone?.id === ringtone.id;
  const isActive = isCurrent && isPlaying;



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

  const handleCardClick = () => {
    router.push(`/ringtone/${ringtone.slug}`);
  };

  // Extract the ringtone name (segmentName) from the title
  // Format can be: "Song Name - Ringtone Name" or just "Ringtone Name"
  let displayName = ringtone.title;

  // Strategy 1: If title contains " - ", split and take the part after the dash
  // This handles "Chella Magale - en kai kulla malarnthava..." format
  if (displayName.includes(' - ')) {
    const parts = displayName.split(' - ');
    // Take everything after the first dash
    displayName = parts.slice(1).join(' - ').trim();
  }
  // Strategy 2: If there's a song_name in the database and the title starts with it, remove it
  else if (ringtone.song_name && ringtone.title.toLowerCase().startsWith(ringtone.song_name.toLowerCase())) {
    displayName = ringtone.title.substring(ringtone.song_name.length).trim();
    // Remove leading dash or hyphen
    displayName = displayName.replace(/^[-–—]\s*/, '').trim();
  }

  // Remove (From "Movie") pattern if present
  displayName = displayName.replace(/\(From ".*?"\)/i, '').trim();

  // Remove movie name if it's still present
  if (ringtone.movie_name) {
    displayName = displayName.replace(new RegExp(`\\s*[-|]?\\s*${ringtone.movie_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[-|]?\\s*`, 'i'), '').trim();
  }

  // Fallback: If cleaning removed everything (rare edge case), show original
  if (!displayName) displayName = ringtone.title;

  return (
    <>
      <div
        ref={cardRef}
        onClick={handleCardClick}
        className="group relative bg-white border border-zinc-200 rounded-xl p-3 sm:p-4 transition-all duration-200 hover:border-zinc-300 hover:shadow-md cursor-pointer active:scale-[0.98] active:bg-zinc-50"
      >
        <div className="flex items-center gap-3 sm:gap-4">

          {/* 1. Album Art + Play Button */}
          <div className="relative w-[72px] h-[72px] sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-100">
            <Link href={`/ringtone/${ringtone.slug}`} className="block w-full h-full relative" onClick={(e) => e.stopPropagation()}>
              {ringtone.poster_url ? (
                <Image
                  src={getImageUrl(ringtone.poster_url)}
                  alt={ringtone.title}
                  fill
                  sizes="(max-width: 640px) 72px, 80px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-300">
                  <Music size={28} />
                </div>
              )}
            </Link>

            {/* Play Button Overlay - Larger touch target for mobile */}
            <button
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/10 active:bg-black/30 transition-colors z-10 touch-manipulation"
              aria-label={isActive ? 'Pause' : 'Play'}
            >
              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-all duration-200 ${isActive ? 'bg-brand-accent text-white scale-110' : 'bg-white text-zinc-900 active:scale-95'}`}>
                {isActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
              </div>
            </button>
          </div>

          {/* 2. Content Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
            <div className="block">
              {/* Line 1: Ringtone Name (Segment Name) */}
              <h3 className="text-base sm:text-[17px] font-bold text-zinc-900 truncate leading-tight">
                {displayName}
              </h3>

              {/* Line 2: Song Name */}
              {ringtone.song_name && (
                <p className="text-[13px] sm:text-sm text-zinc-600 truncate font-medium mt-0.5">
                  {ringtone.song_name}
                </p>
              )}

              {/* Line 3: Movie Name */}
              <p className="text-xs sm:text-[13px] text-zinc-500 truncate font-normal mt-0.5">
                {ringtone.movie_name}
              </p>
            </div>

            {/* Tags - Hidden on very small screens to save space */}
            {ringtone.tags && ringtone.tags.length > 0 && (
              <div className="hidden xs:flex flex-wrap gap-1.5 mt-1">
                {ringtone.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-50 text-zinc-500 border border-zinc-100 truncate max-w-[70px]">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Progress or Stats */}
            {isActive ? (
              <div className="max-w-[160px] w-full h-1.5 bg-zinc-100 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-brand-accent transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1.5 text-xs sm:text-[13px] font-medium text-zinc-400">
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

          {/* 3. Actions (Right Side) - Optimized for mobile touch */}
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2">

            {/* Like - Larger touch target for mobile */}
            <button
              onClick={handleLike}
              className={`min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 p-2.5 sm:p-2 rounded-full transition-all touch-manipulation active:scale-90 ${isLiked ? 'text-rose-500 bg-rose-50' : 'text-zinc-400 active:bg-zinc-100 hover:text-zinc-600 hover:bg-zinc-50'
                }`}
              aria-label={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart size={20} className={isLiked ? 'fill-current' : ''} />
            </button>

            {/* Assign Button */}
            {assignTo && (
              <button
                onClick={handleAssign}
                className="min-h-[44px] px-5 py-2 bg-brand-accent text-white text-sm font-bold rounded-full hover:bg-brand-accent/90 active:scale-95 transition-transform touch-manipulation"
              >
                Assign
              </button>
            )}

            {/* Share - Show on mobile too with icon only */}
            <button
              onClick={handleShare}
              className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 p-2.5 sm:p-2 text-zinc-400 hover:text-zinc-700 active:bg-zinc-100 hover:bg-zinc-50 rounded-full transition-all touch-manipulation active:scale-90"
              aria-label="Share"
            >
              <Share2 size={20} />
            </button>

          </div>
        </div>
      </div>


    </>
  );
}
