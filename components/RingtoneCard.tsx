'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Pause, Heart, Share2, Music, Download, Clock } from 'lucide-react';
import { Ringtone } from '@/types';
import { usePlayer } from '@/context/PlayerContext';
import { incrementLikes } from '@/app/actions/ringtones';
import { getImageUrl } from '@/lib/tmdb';
import TMDBImage from './TMDBImage';
import { useFavorites } from '@/context/FavoritesContext';

import { useRouter } from 'next/navigation';
import { hapticFeedback } from '@/lib/haptics';




interface RingtoneCardProps {
  ringtone: Ringtone;
  assignTo?: string;
}

const TAGS_WHITELIST = [
  'bgm', 'vocal', 'instrumental', 'interlude', 'humming', 'dialogue',
  'remix', '8d audio', 'whistle', 'theme', 'background', 'flute',
  'violin', 'guitar', 'piano', 'snippet', 'bit', 'cut'
];

export default function RingtoneCard({ ringtone, assignTo }: RingtoneCardProps) {
  const { currentRingtone, isPlaying, playRingtone, togglePlay, progress } = usePlayer();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(ringtone.likes || 0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsLiked(isFavorite(ringtone.id));
  }, [ringtone.id, isFavorite]);
  const [loadedDuration, setLoadedDuration] = useState<number | null>(ringtone.duration || null);

  useEffect(() => {
    if (!loadedDuration && ringtone.audio_url) {
      const audio = new Audio();
      audio.src = ringtone.audio_url;
      audio.preload = 'metadata';
      const handler = () => {
        if (audio.duration && audio.duration !== Infinity) {
          setLoadedDuration(audio.duration);
        }
      };
      audio.addEventListener('loadedmetadata', handler);
      return () => {
        audio.removeEventListener('loadedmetadata', handler);
        audio.src = '';
      };
    }
  }, [ringtone.audio_url, loadedDuration]);

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
    hapticFeedback(20);
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
    hapticFeedback(15);

    if (!isLiked) {
      setLikesCount(prev => prev + 1);
      setIsLiked(true);
      addFavorite({
        id: ringtone.id,
        name: ringtone.title,
        type: 'Ringtone',
        imageUrl: ringtone.poster_url,
        href: `/ringtone/${ringtone.slug}`,
        ringtoneData: ringtone
      });
      await incrementLikes(ringtone.id);
    } else {
      setLikesCount(prev => prev - 1);
      setIsLiked(false);
      removeFavorite(ringtone.id);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    hapticFeedback(10);

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
  let displayName = ringtone.title;
  const song = ringtone.song_name ? ringtone.song_name.trim() : '';
  const movie = ringtone.movie_name ? ringtone.movie_name.trim() : '';

  // 1. Define Similarity Check (Simple but effective for common typos)
  const isSimilar = (a: string, b: string) => {
    if (!a || !b) return false;
    const s1 = a.toLowerCase().trim();
    const s2 = b.toLowerCase().trim();
    if (s1 === s2) return true;
    if (s1.includes(s2) || s2.includes(s1)) return true;
    // Common case: Typos at the end (Amaran vs Amaram) or transliteration (Vidaamuyarchi vs Vidamyarchi)
    // Check if they share a significant prefix (first 4-5 chars)
    if (s1.length >= 4 && s2.length >= 4 && s1.substring(0, 4) === s2.substring(0, 4)) return true;
    return false;
  };

  // 2. Identify the "Unique Segment" (e.g., Whistle, BGM, Pallavi)
  // We extract words from the title that aren't the movie or song
  const titleWords = ringtone.title.split(/\s+[-–—:|]+\s+|\s+/);
  const segmentWords = titleWords.filter(word => {
    const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '');
    if (cleanWord.length < 2) return false;
    if (isSimilar(cleanWord, movie)) return false;
    if (isSimilar(cleanWord, song)) return false;
    // Filter out obvious noise and common generic filler words
    if (/^(from|movie|song|ringtone|mp3|download|tamil|official|by|for|with|in)$/i.test(cleanWord)) return false;
    return true;
  });

  const uniqueSegment = segmentWords.join(' ');

  // 3. Build the Final SEO-Optimized Title
  // We prioritize: [Unique Segment] - [Official Song Name]
  if (uniqueSegment && song) {
    displayName = `${uniqueSegment} - ${song}`;
  } else if (song) {
    displayName = song;
  } else if (uniqueSegment && movie) {
    displayName = `${uniqueSegment} - ${movie}`;
  } else {
    displayName = movie || ringtone.title;
  }

  // Final Polish
  displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  return (
    <>
      <div
        ref={cardRef}
        onClick={handleCardClick}
        className="group relative bg-white border border-zinc-200 rounded-xl p-3 sm:p-4 transition-all duration-200 hover:border-zinc-300 hover:shadow-md cursor-pointer active:scale-[0.98] active:bg-zinc-50"
      >
        <div className="flex items-center gap-3 sm:gap-4">

          {/* 1. Left Section: Album Art + Play Button + Duration */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div
              onClick={handlePlay}
              className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-brand-wash flex items-center justify-center border border-brand-border group/play cursor-pointer shadow-sm active:scale-95 transition-transform"
            >
              <TMDBImage
                path={ringtone.poster_url}
                alt={ringtone.title}
                fill
                sizes="(max-width: 640px) 56px, 64px"
                className="object-cover transition-transform duration-500 group-hover/play:scale-110"
              />

              {/* Play Button Overlay */}
              <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-brand-accent/40' : 'bg-black/10 group-hover/play:bg-black/30'}`}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md transition-all duration-200 ${isActive ? 'bg-white text-brand-accent scale-110' : 'bg-white/90 text-zinc-900 group-hover/play:scale-110'}`}>
                  {isActive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                </div>
              </div>


            </div>

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
              <div className="mt-2.5 mb-1.5 flex flex-col w-full animate-in fade-in slide-in-from-top-1">
                <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-accent transition-all duration-100 ease-linear rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="w-full flex items-center justify-end text-[10px] font-black text-brand-accent mt-1.5 px-0.5">
                  <span className="bg-brand-wash px-1 rounded">
                    {formatDuration((progress / 100) * (loadedDuration || 0))} / {formatDuration(loadedDuration)}
                  </span>
                </div>
              </div>
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
                  {ringtone.downloads > 0 ? (ringtone.downloads > 1000 ? `${(ringtone.downloads / 1000).toFixed(1)}k` : ringtone.downloads) : 0} Downloads
                </span>
                <span className="text-zinc-400">•</span>
                <span>
                  {likesCount > 0 ? (likesCount > 1000 ? `${(likesCount / 1000).toFixed(1)}k` : likesCount) : 0} Likes
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
              aria-label={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart size={20} className={isLiked ? 'fill-current' : ''} />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center justify-center w-10 h-10 text-zinc-500 hover:text-brand-accent hover:bg-brand-wash rounded-full transition-all touch-manipulation active:scale-90"
              aria-label="Share"
            >
              <Share2 size={18} />
            </button>

            {/* Assign Button - Only when assigning */}
            {assignTo && (
              <button
                onClick={handleAssign}
                className="mt-1 h-7 px-3 bg-brand-accent text-white text-[10px] font-bold rounded-lg hover:bg-brand-accent/90 active:scale-95 transition-transform touch-manipulation"
              >
                Assign
              </button>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
