"use client";

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Heart, Download } from 'lucide-react';
import { Ringtone } from '@/types';
import { usePlayer } from '@/context/PlayerContext';
import { incrementLikes } from '@/app/actions/ringtones';
import MiniPlayerBar from './MiniPlayerBar';
import TMDBImage from './TMDBImage';
import { useFavorites } from '@/context/FavoritesContext';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
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
  const [localDownloads, setLocalDownloads] = useState(ringtone.downloads || 0);
  const [showHeartPop, setShowHeartPop] = useState(false);
  // We rely on either DB duration or the player's duration for performance
  const [loadedDuration] = useState<number | null>(ringtone.duration || null);

  const formatCount = (count: number) => {
    if (!count || count <= 0) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    return count.toString();
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
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isActive, togglePlay]);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    hapticFeedback(hapticPatterns.impact);
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


  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    hapticFeedback(hapticPatterns.download);
    setLocalDownloads(prev => prev + 1);

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

  const handleMouseEnter = () => {
    router.prefetch(`/ringtone/${ringtone.slug}`);
  };

  // Background title parsing
  const displayName = useTitleParser(ringtone.title, ringtone.song_name, ringtone.movie_name);

  // Determine secondary contextual metadata
  const secondaryContext = ringtone.movie_name && !displayName.toLowerCase().includes(ringtone.movie_name.toLowerCase())
    ? ringtone.movie_name
    : ringtone.song_name && !displayName.toLowerCase().includes(ringtone.song_name.toLowerCase())
      ? ringtone.song_name
      : null;

  const topTag = ringtone.tags && ringtone.tags.length > 0 ? ringtone.tags[0] : (ringtone.mood || null);

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      className="group relative bg-m3-surface-container-low hover:bg-m3-surface-container border border-m3-outline-variant/35 rounded-xl px-2.5 py-2 sm:px-3 sm:py-2.5 transition-all duration-200 shadow-2xs hover:shadow-xs"
    >
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* 1. Left: Compact Album Art + Play Button + Duration Overlay */}
        <div className="relative shrink-0">
          <button
            onClick={handlePlay}
            type="button"
            aria-label={isActive ? `Pause ${displayName}` : `Play ${displayName}`}
            className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl overflow-hidden bg-m3-surface-container-high flex items-center justify-center border group/play cursor-pointer shadow-2xs active:scale-95 transition-all p-0 ${
              isActive ? 'ring-2 ring-m3-primary border-m3-primary' : 'border-m3-outline-variant/40'
            }`}
          >
            <TMDBImage
              path={ringtone.poster_url}
              alt=""
              fallbackAlt={ringtone.title}
              fill
              sizes="(max-width: 640px) 40px, 44px"
              priority={priority}
              className="object-cover transition-transform duration-500 group-hover/play:scale-105"
            />

            {/* Heart Pop Animation Overlay */}
            {showHeartPop && (
              <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                <Heart
                  size={28}
                  className="text-m3-primary fill-m3-primary scale-150 opacity-0 animate-heart-pop"
                />
              </div>
            )}

            {/* Pure Play/Pause Glyph without opaque background plate */}
            {isActive ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[0.5px] transition-all duration-200">
                <Pause
                  size={15}
                  fill="white"
                  className="text-white fill-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] scale-105"
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center transition-transform duration-200 group-hover/play:scale-110 pointer-events-none">
                <Play
                  size={15}
                  fill="white"
                  className="text-white/95 fill-white/95 ml-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]"
                />
              </div>
            )}
          </button>
        </div>

        {/* 2. Middle: Title + 1-Line Compact Metadata Rail */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
          {/* Line 1: Title (Clickable) */}
          <Link
            href={`/ringtone/${ringtone.slug}`}
            className="text-xs sm:text-sm font-bold text-m3-on-surface truncate leading-tight hover:text-m3-primary transition-colors block"
            title={displayName}
          >
            {displayName}
          </Link>

          {/* Line 2: Contextual Metadata (Movie/Song • Tag • Metric) */}
          {!isActive && (
            <div className="flex items-center gap-1 text-[11px] text-m3-outline truncate">
              {secondaryContext && (
                <span className="truncate text-m3-on-surface-variant font-medium max-w-[120px] sm:max-w-[160px]">
                  {secondaryContext}
                </span>
              )}
              {secondaryContext && topTag && (
                <span className="text-m3-outline-variant shrink-0">•</span>
              )}
              {topTag && (
                <span className="shrink-0 text-m3-outline font-medium text-[10px] sm:text-[11px]">
                  #{topTag}
                </span>
              )}
            </div>
          )}

          {/* Active Playback Waveform */}
          {isActive && (
            <div className="mt-1">
              <MiniPlayerBar loadedDuration={loadedDuration} />
            </div>
          )}
        </div>

        {/* 3. Right: Ergonomic Horizontal Action Cluster */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Like */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 h-8 px-2 rounded-full transition-all active:scale-90 cursor-pointer ${
              isLiked 
                ? 'text-m3-primary bg-m3-primary-container/80 shadow-2xs' 
                : 'text-m3-outline hover:text-m3-primary hover:bg-m3-surface-container'
            }`}
            title={`${formatCount(localLikes)} ${t('likes')}`}
            aria-label={isLiked ? `${t('unlike')} (${formatCount(localLikes)})` : `${t('like')} (${formatCount(localLikes)})`}
          >
            <Heart size={14} className={isLiked ? 'fill-current' : ''} />
            <span className="text-[11px] font-semibold tabular-nums leading-none">
              {formatCount(localLikes)}
            </span>
          </button>

          {/* Download (Primary CTA) */}
          {assignTo ? (
            <button
              onClick={handleAssign}
              className="h-8 px-2.5 bg-m3-primary text-m3-on-primary text-[10px] font-bold rounded-full hover:shadow-xs active:scale-95 transition-all"
            >
              {t('assign')}
            </button>
          ) : (
            <Link
              href={`/ringtone/${ringtone.slug}`}
              onClick={handleDownload}
              className="flex items-center gap-1 h-8 px-2 text-m3-outline hover:text-m3-primary hover:bg-m3-surface-container rounded-full transition-all active:scale-90 cursor-pointer"
              title={`${formatCount(localDownloads)} ${t('downloads')}`}
              aria-label={`Download (${formatCount(localDownloads)})`}
            >
              <Download size={14} />
              <span className="text-[11px] font-semibold tabular-nums leading-none">
                {formatCount(localDownloads)}
              </span>
            </Link>
          )}

        </div>
      </div>
    </div>
  );
}


