'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, Pause, Heart, Download } from 'lucide-react';
import { Ringtone } from '@/types';
import { usePlayer } from '@/context/PlayerContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useLanguage } from '@/context/LanguageContext';
import { incrementLikes } from '@/app/actions/ringtones';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';
import { generateRingtoneFilename } from '@/lib/utils';
import MiniPlayerBar from '@/components/MiniPlayerBar';

interface CompactRingtoneRowProps {
  ringtone: Ringtone;
  cleanTitle?: string;
  trackNumber?: number;
}

export default function CompactRingtoneRow({
  ringtone,
  cleanTitle,
  trackNumber,
}: CompactRingtoneRowProps) {
  const { currentRingtone, isPlaying, playRingtone, togglePlay } = usePlayer();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { t } = useLanguage();

  const isLiked = isFavorite(ringtone.id);
  const [localLikes, setLocalLikes] = useState(ringtone.likes || 0);

  const isCurrent = currentRingtone?.id === ringtone.id;
  const isActive = isCurrent && isPlaying;

  const displayTitle = cleanTitle || ringtone.title;

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

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    hapticFeedback(hapticPatterns.selection);

    if (isLiked) {
      removeFavorite(ringtone.id);
      setLocalLikes((prev) => Math.max(0, prev - 1));
    } else {
      addFavorite({
        id: ringtone.id,
        name: ringtone.title,
        type: 'Ringtone',
        imageUrl: ringtone.poster_url,
        href: `/ringtone/${ringtone.slug}`,
        ringtoneData: ringtone,
      });
      setLocalLikes((prev) => prev + 1);
      incrementLikes(ringtone.id).catch(console.error);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    hapticFeedback(hapticPatterns.download);
    setLocalDownloads((prev) => prev + 1);

    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !('MSStream' in window);

    let targetUrl = ringtone.audio_url;
    let targetExt = 'mp3';

    if (isIOS && ringtone.audio_url_iphone) {
      targetUrl = ringtone.audio_url_iphone;
      targetExt = 'm4r';
    }

    const filename = generateRingtoneFilename(ringtone.title, ringtone.song_name, ringtone.movie_name, targetExt);
    const apiUrl = `/api/download?url=${encodeURIComponent(targetUrl)}&filename=${encodeURIComponent(filename)}&id=${ringtone.id}`;

    window.location.href = apiUrl;
  };

  const [localDownloads, setLocalDownloads] = useState(ringtone.downloads || 0);

  const formatCount = (count: number) => {
    if (!count || count <= 0) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    return count.toString();
  };

  const formattedDownloads = formatCount(localDownloads);
  const formattedLikes = formatCount(localLikes);

  return (
    <div
      className={`group relative flex items-center gap-2.5 sm:gap-3 px-3 py-2 sm:py-2.5 rounded-xl border transition-all duration-150 ${
        isActive
          ? 'bg-m3-primary/10 border-m3-primary/40 shadow-xs'
          : 'bg-m3-surface-container-low hover:bg-m3-surface-container border-m3-outline-variant/30 hover:border-m3-outline-variant/60'
      }`}
    >
      {/* 1. Play / Pause Circular Button (Replaces Album Art) */}
      <button
        onClick={handlePlay}
        type="button"
        aria-label={isActive ? `Pause ${displayTitle}` : `Play ${displayTitle}`}
        className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90 cursor-pointer shadow-xs ${
          isActive
            ? 'bg-m3-primary text-m3-on-primary ring-2 ring-m3-primary/50'
            : 'bg-m3-surface-container-high hover:bg-m3-primary hover:text-m3-on-primary text-m3-on-surface border border-m3-outline-variant/40'
        }`}
      >
        {isActive ? (
          <Pause size={17} fill="currentColor" />
        ) : (
          <Play size={17} fill="currentColor" className="ml-0.5" />
        )}
      </button>

      {/* 2. Middle Content Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
        <div className="flex items-center gap-1.5">
          {trackNumber && (
            <span className="text-[11px] font-semibold text-m3-outline shrink-0">
              {trackNumber}.
            </span>
          )}
          <Link
            href={`/ringtone/${ringtone.slug}`}
            className="text-xs sm:text-sm font-bold text-m3-on-surface hover:text-m3-primary transition-colors line-clamp-1 truncate"
            title={displayTitle}
          >
            {displayTitle}
          </Link>
        </div>

        {/* Dynamic Subtitle: Micro Equalizer and Time when playing, Meta line when idle */}
        {isActive ? (
          <div className="w-full max-w-xs">
            <MiniPlayerBar loadedDuration={ringtone.duration || null} />
          </div>
        ) : ringtone.tags && ringtone.tags.length > 0 ? (
          <div className="flex items-center gap-2 text-[11px] text-m3-outline font-medium">
            <span className="text-m3-outline font-medium truncate max-w-[140px] sm:max-w-[200px]">
              #{ringtone.tags[0]} {ringtone.tags[1] ? `• #${ringtone.tags[1]}` : ''}
            </span>
          </div>
        ) : null}
      </div>

      {/* 3. Ergonomic Right-Side Actions (Like & Download with Counts) */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Like */}
        <button
          onClick={handleLike}
          type="button"
          title={`${formattedLikes} ${t('likes')}`}
          aria-label={isLiked ? `${t('unlike')} ${displayTitle} (${formattedLikes})` : `${t('like')} ${displayTitle} (${formattedLikes})`}
          className={`h-8 px-2 sm:px-2.5 rounded-full flex items-center gap-1 sm:gap-1.5 transition-all active:scale-90 cursor-pointer ${
            isLiked
              ? 'text-m3-primary bg-m3-primary-container shadow-2xs'
              : 'text-m3-outline hover:text-m3-primary hover:bg-m3-surface-container-high'
          }`}
        >
          <Heart
            size={14}
            className={`transition-transform duration-200 shrink-0 ${isLiked ? 'fill-current scale-110' : ''}`}
          />
          <span className="text-[11px] font-semibold tabular-nums leading-none">
            {formattedLikes}
          </span>
        </button>

        {/* Download */}
        <button
          onClick={handleDownload}
          type="button"
          title={`${formattedDownloads} ${t('downloads')}`}
          aria-label={`${t('download')} ${displayTitle} (${formattedDownloads})`}
          className="h-8 px-2 sm:px-2.5 rounded-full flex items-center gap-1 sm:gap-1.5 text-m3-outline hover:text-m3-primary hover:bg-m3-surface-container-high transition-all active:scale-90 cursor-pointer"
        >
          <Download size={14} className="shrink-0" />
          <span className="text-[11px] font-semibold tabular-nums leading-none">
            {formattedDownloads}
          </span>
        </button>
      </div>
    </div>
  );
}
