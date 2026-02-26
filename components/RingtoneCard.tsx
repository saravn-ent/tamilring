"use client";

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Heart, Share2, Download } from 'lucide-react';
import { Ringtone } from '@/types';
import { usePlayer } from '@/context/PlayerContext';
import { incrementLikes } from '@/app/actions/ringtones';
import MiniPlayerBar from './MiniPlayerBar';
import TMDBImage from './TMDBImage';
import { useFavorites } from '@/context/FavoritesContext';
import { useLanguage } from '@/context/LanguageContext';

import { useRouter } from 'next/navigation';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';
import { useTitleParser } from '@/hooks/useTitleParser';
import { generateRingtoneFilename } from '@/lib/utils';

interface RingtoneCardProps {
  ringtone: Ringtone;
  assignTo?: string;
  priority?: boolean;
}

export default function RingtoneCard({ ringtone, assignTo, priority }: RingtoneCardProps) {
  const { currentRingtone, isPlaying, playRingtone, togglePlay } = usePlayer();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { t } = useLanguage();
  const isLiked = isFavorite(ringtone.id);
  const [localLikes, setLocalLikes] = useState(ringtone.likes || 0);
  const [showHeartPop, setShowHeartPop] = useState(false);
  // We rely on either DB duration or the player's duration for performance
  const [loadedDuration] = useState<number | null>(ringtone.duration || null);

  const formatDuration = (seconds: number | null) => {
    if (!seconds || isNaN(seconds)) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  const isCurrent = currentRingtone?.id === ringtone.id;
  const isActive = isCurrent && isPlaying;

  useEffect(() => {
    if (!isActive) return;

    // Defer observer setup to avoid blocking initial render
    const timeoutId = setTimeout(() => {
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
    }, 100); // Defer by 100ms

    return () => clearTimeout(timeoutId);
  }, [isActive, togglePlay]);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    hapticFeedback(hapticPatterns.impact);
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

  const handleLike = async (e: React.MouseEvent, triggerAnimation: boolean = false) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLiked) {
      if (triggerAnimation) {
        setShowHeartPop(true);
        setTimeout(() => setShowHeartPop(false), 800);
      }
      hapticFeedback(hapticPatterns.heartbeat);
      addFavorite({
        id: ringtone.id,
        name: ringtone.title,
        type: 'Ringtone',
        imageUrl: ringtone.poster_url,
        href: `/ringtone/${ringtone.slug}`,
        ringtoneData: ringtone
      });
      setLocalLikes(prev => prev + 1);
      await incrementLikes(ringtone.id);
    } else {
      hapticFeedback(hapticPatterns.selection);
      removeFavorite(ringtone.id);
      setLocalLikes(prev => Math.max(0, prev - 1));
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    hapticFeedback(hapticPatterns.selection);

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

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    hapticFeedback(hapticPatterns.success);

    // OS Detection for Format
    const userAgent = window.navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !('MSStream' in window);

    let targetUrl = ringtone.audio_url;
    let targetExt = 'mp3';

    if (isIOS && ringtone.audio_url_iphone) {
      targetUrl = ringtone.audio_url_iphone;
      targetExt = 'm4r';
    }

    const filename = generateRingtoneFilename(ringtone.title, ringtone.song_name, ringtone.movie_name, targetExt);
    const apiUrl = `/api/download?url=${encodeURIComponent(targetUrl)}&filename=${encodeURIComponent(filename)}&id=${ringtone.id}`;

    // Trigger download via API
    window.location.href = apiUrl;
  };

  const [lastTap, setLastTap] = useState(0);

  const handleCardClick = (e: React.MouseEvent) => {
    // Double Tap Logic
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // It's a double tap!
      if (!isLiked) {
        handleLike(e, true);
      } else {
        setShowHeartPop(true);
        setTimeout(() => setShowHeartPop(false), 800);
      }
      setLastTap(0);
      return;
    }
    
    setLastTap(now);
    
    // Single Tap Logic (Navigate after a small delay to allow double tap to win if it comes)
    // Actually, for better UX in web, we usually navigate immediately on single tap
    // unless there's a specific reason to wait. 
    // But if we navigate immediately, double tap won't work easily.
    // However, on mobile, users expect double tap on the image.
    
    router.push(`/ringtone/${ringtone.slug}`);
  };

  const handleMouseEnter = () => {
    router.prefetch(`/ringtone/${ringtone.slug}`);
  };

  // Use Web Worker for background title parsing (zero main thread blocking)
  const displayName = useTitleParser(ringtone.title, ringtone.song_name, ringtone.movie_name);

  return (
    <>
      <div
        ref={cardRef}
        onClick={handleCardClick}
        onMouseEnter={handleMouseEnter}
        className="group relative bg-white border border-zinc-200 rounded-xl p-3 sm:p-4 transition-all duration-200 hover:border-zinc-300 hover:shadow-md cursor-pointer active:scale-[0.98] active:bg-zinc-50"
      >
        <div className="flex items-center gap-3 sm:gap-4">

          {/* 1. Left Section: Album Art + Play Button + Duration */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <button
              onClick={handlePlay}
              type="button"
              aria-label={isActive ? `Pause ${ringtone.title}` : `Play ${ringtone.title}`}
              className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-brand-wash flex items-center justify-center border border-brand-border group/play cursor-pointer shadow-sm active:scale-95 transition-transform p-0"
            >
              <TMDBImage
                path={ringtone.poster_url}
                alt=""
                fallbackAlt={ringtone.title}
                fill
                sizes="(max-width: 640px) 56px, 64px"
                priority={priority}
                className="object-cover transition-transform duration-500 group-hover/play:scale-110"
              />

              {/* Heart Pop Animation Overlay */}
              {showHeartPop && (
                <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                  <Heart
                    size={40}
                    className="text-rose-500 fill-rose-500 animate-[ping_0.6s_ease-out_infinite] scale-150 opacity-0 animate-heart-pop"
                  />
                </div>
              )}

              {/* Play Button Overlay */}
              <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-brand-accent/40' : 'bg-black/10 group-hover/play:bg-black/30'}`}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md transition-all duration-200 ${isActive ? 'bg-white text-brand-accent scale-110' : 'bg-white/90 text-zinc-900 group-hover/play:scale-110'}`}>
                  {isActive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                </div>
              </div>
            </button>



            {/* Duration Badge below Art (Only when NOT playing) */}
            {!isActive && loadedDuration && (
              <span className="text-[10px] font-black text-zinc-600 bg-zinc-100/50 border border-zinc-200/50 px-1.5 py-0.5 rounded-md leading-none shadow-sm">
                {formatDuration(loadedDuration)}
              </span>
            )}
          </div>

          {/* 2. Content Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
            <div className="block">
              {/* Line 1: Ringtone Name (Segment Name) */}
              <h3 className="text-sm sm:text-[15px] font-semibold text-zinc-900 line-clamp-2 whitespace-normal leading-tight">
                {displayName}
              </h3>

              {/* Line 2: Song Name (Only if not already in title) */}
              {ringtone.song_name && !displayName.toLowerCase().includes(ringtone.song_name.toLowerCase()) && (
                <p className="text-[13px] sm:text-sm text-zinc-700 truncate font-medium mt-0.5">
                  {ringtone.song_name}
                </p>
              )}

              {/* Line 3: Movie Name (Only if not already in title) */}
              {ringtone.movie_name && !displayName.toLowerCase().includes(ringtone.movie_name.toLowerCase()) && (
                <p className="text-xs sm:text-[13px] text-zinc-600 truncate font-normal mt-0.5">
                  {ringtone.movie_name}
                </p>
              )}
            </div>

            {/* Active Player Bar - Now Compact and Integrated */}
            {isActive && (
              <MiniPlayerBar loadedDuration={loadedDuration} />
            )}

            {/* Tags - Visible on all screens, but compact */}
            {ringtone.tags && ringtone.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {ringtone.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-brand-wash text-zinc-600 border border-brand-border/50 font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Stats (Only when NOT playing) */}
            {!isActive && (
              <div className="flex items-center gap-2 mt-1.5 text-xs sm:text-[13px] font-medium text-zinc-500">
                <span>
                  {ringtone.downloads > 0 ? (ringtone.downloads > 1000 ? `${(ringtone.downloads / 1000).toFixed(1)}k` : ringtone.downloads) : 0} {t('downloads')}
                </span>
                <span className="text-zinc-400">•</span>
                <span>
                  {localLikes > 0 ? (localLikes > 1000 ? `${(localLikes / 1000).toFixed(1)}k` : localLikes) : 0} {t('likes')}
                </span>

              </div>
            )}
          </div>

          {/* 3. Actions (Right Side) - Vertical Layout */}
          <div className="flex flex-col items-center gap-0.5 sm:gap-1">

            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all touch-manipulation active:scale-90 ${isLiked ? 'text-rose-500 bg-rose-50' : 'text-zinc-400 hover:text-rose-400 hover:bg-rose-50/50'
                }`}
              aria-label={isLiked ? t('unlike') : t('like')}
            >
              <Heart size={20} className={isLiked ? 'fill-current' : ''} />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center justify-center w-10 h-10 text-zinc-500 hover:text-brand-accent hover:bg-brand-wash rounded-full transition-all touch-manipulation active:scale-90"
              aria-label={t('share')}
            >
              <Share2 size={18} />
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="flex items-center justify-center w-10 h-10 text-zinc-500 hover:text-brand-accent hover:bg-brand-wash rounded-full transition-all touch-manipulation active:scale-90"
              aria-label={t('download')}
            >
              <Download size={18} />
            </button>

            {/* Assign Button - Only when assigning */}
            {assignTo && (
              <button
                onClick={handleAssign}
                className="mt-1 h-7 px-3 bg-brand-accent text-white text-[10px] font-bold rounded-lg hover:bg-brand-accent/90 active:scale-95 transition-transform touch-manipulation"
              >
                {t('assign')}
              </button>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
