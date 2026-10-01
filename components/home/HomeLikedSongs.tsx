"use client";

import React from 'react';
import SectionHeader from '@/components/SectionHeader';
import { useFavorites } from '@/context/FavoritesContext';
import { useLanguage } from '@/context/LanguageContext';
import { usePlayer } from '@/context/PlayerContext';
import { useRouter } from 'next/navigation';
import { Play, Pause } from 'lucide-react';
import TMDBImage from '@/components/TMDBImage';
import { Ringtone } from '@/types';
import { hapticFeedback } from '@/lib/haptics';
import '../../app/animations.css';

export default function HomeLikedSongs() {
  const { favorites } = useFavorites();
  const { currentRingtone, isPlaying, playRingtone, togglePlay } = usePlayer();
  const { t } = useLanguage();
  const router = useRouter();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // Filter for ringtones and reverse to show recent first
  const likedRingtones = favorites
    .filter(item => item.type === 'Ringtone' && item.ringtoneData)
    .map(item => item.ringtoneData!)
    .reverse()
    .slice(0, 10); // Updated limit to 10 for scroll view

  if (likedRingtones.length === 0) {
    return null;
  }

  const handlePlay = (e: React.MouseEvent, ringtone: Ringtone) => {
    e.preventDefault();
    e.stopPropagation();

    if (!ringtone.audio_url) return;

    hapticFeedback(25); // Increased intensity

    // Use standard sync toggle if already current, but yield for play
    if (currentRingtone?.id === ringtone.id) {
      togglePlay();
    } else {
      playRingtone(ringtone);
    }
  };

  const handleCardClick = (slug: string) => {
    router.push(`/ringtone/${slug}`);
  };

  return (
    <div className="mb-10">
      <div className="px-4">
        <SectionHeader translationKey="likedSongs" title="Songs Liked by You" />
      </div>
      <div className="flex gap-3.5 sm:gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 md:overflow-visible">
        {likedRingtones.map((ringtone) => {
          const isCurrent = currentRingtone?.id === ringtone.id;
          const isActive = isCurrent && isPlaying;

          return (
            <div
              key={ringtone.id}
              onClick={() => handleCardClick(ringtone.slug)}
              className="snap-start shrink-0 w-32 sm:w-36 md:w-full group cursor-pointer"
            >
              <div className="relative w-32 sm:w-36 md:w-full h-44 sm:h-48 md:h-auto md:aspect-2/3 rounded-2xl overflow-hidden mb-2 bg-m3-surface-container-low shadow-xs group-hover:shadow-md transition-all border border-m3-outline-variant/30 active:scale-95">
                <TMDBImage
                  path={ringtone.poster_url}
                  alt=""
                  fallbackAlt={ringtone.title}
                  fill
                  sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 16vw"
                  quality={75}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Overlay Gradient */}
                <div className={`absolute inset-0 bg-linear-to-t from-black/90 via-black/25 to-transparent transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-75 group-hover:opacity-85'}`} />

                {/* Playing Indicator (Top Right) */}
                {isActive && (
                  <div className="absolute top-2 right-2 flex gap-0.5 items-end h-3 z-20">
                    <div className="w-1 bg-m3-primary rounded-full animate-music-bar-1" />
                    <div className="w-1 bg-m3-primary rounded-full animate-music-bar-2" />
                    <div className="w-1 bg-m3-primary rounded-full animate-music-bar-3" />
                  </div>
                )}

                {/* Play Button - Bottom Right Corner */}
                <div className="absolute bottom-2.5 right-2.5 z-30">
                  <button
                    type="button"
                    onClick={(e) => handlePlay(e, ringtone)}
                    className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md shadow-md transition-all duration-200 hover:scale-110 active:scale-90 pointer-events-auto cursor-pointer ${
                      isActive
                        ? 'bg-m3-primary text-m3-on-primary scale-105 shadow-m3-primary/30'
                        : 'bg-black/40 text-white border border-white/20 hover:bg-m3-primary hover:text-m3-on-primary hover:border-transparent'
                    }`}
                    aria-label={isActive ? `Pause ${ringtone.title}` : `Play ${ringtone.title}`}
                  >
                    {isActive ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                  </button>
                </div>

              </div>
              <p className="text-xs font-bold text-m3-on-surface truncate group-hover:text-m3-primary transition-colors">{ringtone.title}</p>
              <p className="text-[11px] text-m3-on-surface-variant font-medium truncate">{ringtone.movie_name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
