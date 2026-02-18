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
    hapticFeedback(25); // Increased intensity

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
    <div className="mb-10">
      <div className="px-4">
        <SectionHeader translationKey="likedSongs" title="Songs Liked by You" />
      </div>
      <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 md:overflow-visible">
        {likedRingtones.map((ringtone) => {
          const isCurrent = currentRingtone?.id === ringtone.id;
          const isActive = isCurrent && isPlaying;

          return (
            <div
              key={ringtone.id}
              onClick={() => handleCardClick(ringtone.slug)}
              className="snap-start shrink-0 w-32 sm:w-36 md:w-full group cursor-pointer"
            >
              <div className="relative w-32 sm:w-36 md:w-full h-44 sm:h-48 md:h-auto md:aspect-2/3 rounded-xl overflow-hidden mb-2 bg-brand-wash shadow-lg group-hover:shadow-brand-accent/20 transition-all border border-brand-border/50 active:scale-95">
                <TMDBImage
                  path={ringtone.poster_url}
                  alt=""
                  fallbackAlt={ringtone.title}
                  fill
                  sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 16vw"
                  quality={75}
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Overlay Gradient */}
                <div className={`absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-90'}`} />

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
                    aria-label={isActive ? `Pause ${ringtone.title}` : `Play ${ringtone.title}`}
                  >
                    {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-0.5" />}
                  </button>
                </div>

              </div>
              <p className="text-xs font-bold text-black truncate group-hover:text-brand-accent transition-colors">{ringtone.title}</p>
              <p className="text-[10px] text-brand-dark truncate">{ringtone.movie_name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
