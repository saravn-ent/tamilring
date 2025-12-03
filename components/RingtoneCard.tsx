'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Pause, Music, Download, Heart } from 'lucide-react';
import { Ringtone } from '@/types';
import { usePlayer } from '@/context/PlayerContext';
import RippleWrapper from './Ripple';

interface RingtoneCardProps {
  ringtone: Ringtone;
}

export default function RingtoneCard({ ringtone }: RingtoneCardProps) {
  const { currentRingtone, isPlaying, playRingtone, togglePlay, progress } = usePlayer();
  const [imgError, setImgError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLiked, setIsLiked] = useState(false); // Local state for immediate feedback
  const [likesCount, setLikesCount] = useState(ringtone.likes || 0);
  const [animateLike, setAnimateLike] = useState(false);

  const isCurrent = currentRingtone?.id === ringtone.id;
  const isActive = isCurrent && isPlaying;

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isCurrent) {
      togglePlay();
    } else {
      playRingtone(ringtone);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setIsDownloading(true);
      const response = await fetch(ringtone.audio_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      // Filename: Movie - Song.mp3
      a.download = `${ringtone.movie_name} - ${ringtone.title}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to direct link
      window.open(ringtone.audio_url, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: Implement actual API call to toggle like
    if (!isLiked) {
      setAnimateLike(true);
      setTimeout(() => setAnimateLike(false), 300);
    }
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  // Helper to get initials for fallback
  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : 'TR';

  // Helper to format numbers (e.g. 1200 -> 1.2k)
  const formatCount = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 flex items-center gap-4 hover:bg-white/10 transition-colors group relative shadow-lg shadow-black/20">
      
      {/* Left: Thumbnail & Play Interaction */}
      <div className="relative shrink-0 w-20 h-28 rounded-lg overflow-hidden bg-neutral-800 shadow-md group-poster">
        {!imgError && ringtone.poster_url ? (
          <Image
            src={ringtone.poster_url}
            alt={ringtone.movie_name}
            fill
            className="object-cover"
            sizes="80px"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-900 to-neutral-900">
            <Music size={20} className="text-emerald-500/50 mb-1" />
            <span className="text-[10px] font-bold text-emerald-500/50">{getInitials(ringtone.movie_name)}</span>
          </div>
        )}

        {/* Play Overlay Button */}
        <RippleWrapper 
          onClick={handlePlay} 
          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors z-10 cursor-pointer"
          aria-label={isActive ? "Pause" : "Play"}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg transition-transform active:scale-95 ${isActive ? 'bg-emerald-500 text-white' : 'bg-black/60 text-white'}`}>
            {isActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
          </div>
        </RippleWrapper>
      </div>

      {/* Middle: Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1 self-center">
        <Link href={`/ringtone/${ringtone.slug}`} className="block group-hover:text-emerald-400 transition-colors">
          <h3 className={`font-bold text-lg truncate leading-tight ${isCurrent ? 'text-emerald-400' : 'text-zinc-100'}`}>
            {ringtone.title}
          </h3>
        </Link>
        
        <Link href={`/movie/${encodeURIComponent(ringtone.movie_name)}`} className="text-sm text-zinc-400 truncate hover:text-emerald-500 transition-colors w-fit">
          {ringtone.movie_name}
        </Link>

        {/* Singers - High Visibility */}
        {ringtone.singers && (
          <div className="flex flex-wrap gap-1 text-xs mt-0.5">
            {ringtone.singers.split(',').map((singer, idx) => (
              <span key={idx} className="flex items-center text-emerald-500/90 font-medium">
                <Link 
                  href={`/artist/${encodeURIComponent(singer.trim())}`}
                  className="hover:text-emerald-400 hover:underline decoration-emerald-500/50"
                >
                  {singer.trim()}
                </Link>
                {idx < ringtone.singers.split(',').length - 1 && <span className="text-zinc-600 mr-1">,</span>}
              </span>
            ))}
          </div>
        )}

        {/* Progress Bar (Only visible when playing) */}
        {isCurrent && (
          <div className="h-1 bg-neutral-800 rounded-full overflow-hidden mt-2 w-full">
            <div 
              className="h-full bg-emerald-500 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Right: Actions (Vertical Stack) */}
      <div className="flex flex-col items-center gap-2 shrink-0 border-l border-white/10 pl-3 py-1">
        {/* Like Button */}
        <RippleWrapper 
          onClick={handleLike}
          className="flex flex-col items-center justify-center w-12 h-12 rounded-full hover:bg-neutral-800/80 active:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Like"
        >
          <Heart size={24} className={`transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-zinc-400"} ${animateLike ? 'animate-like' : ''}`} />
          <span className="text-[10px] font-bold text-zinc-500 mt-0.5">{formatCount(likesCount)}</span>
        </RippleWrapper>

        {/* Download Button */}
        <RippleWrapper 
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex flex-col items-center justify-center w-12 h-12 rounded-full hover:bg-neutral-800/80 active:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Download"
        >
          {isDownloading ? (
            <div className="w-5 h-5 border-2 border-zinc-500 border-t-emerald-500 rounded-full animate-spin" />
          ) : (
            <Download size={24} className="text-zinc-400" />
          )}
          <span className="text-[10px] font-bold text-zinc-500 mt-0.5">{formatCount(ringtone.downloads)}</span>
        </RippleWrapper>
      </div>

    </div>
  );
}
