'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Pause, Music, Mic, Download, Disc, Clapperboard, Heart } from 'lucide-react';
import { Ringtone } from '@/types';
import { usePlayer } from '@/context/PlayerContext';

interface RingtoneCardProps {
  ringtone: Ringtone;
}

export default function RingtoneCard({ ringtone }: RingtoneCardProps) {
  const { currentRingtone, isPlaying, playRingtone, togglePlay, progress } = usePlayer();
  const [imgError, setImgError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLiked, setIsLiked] = useState(false); // Local state for immediate feedback
  const [likesCount, setLikesCount] = useState(ringtone.likes || 0);

  const isCurrent = currentRingtone?.id === ringtone.id;
  const isActive = isCurrent && isPlaying;

  const handlePlay = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playRingtone(ringtone);
    }
  };

  const handleDownload = async () => {
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

  const handleLike = () => {
    // TODO: Implement actual API call to toggle like
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
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm hover:border-emerald-500/30 transition-all group relative">
      
      {/* Progress Bar (Only visible when playing) */}
      {isCurrent && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-800 z-20">
          <div 
            className="h-full bg-emerald-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Top Section: Metadata */}
      <div className="flex gap-3 p-3">
        {/* Poster & Play Button */}
        <div className="shrink-0 relative w-16 h-20">
           <Link href={`/movie/${encodeURIComponent(ringtone.movie_name)}`} className="block w-full h-full">
            <div className="relative w-full h-full rounded-lg overflow-hidden bg-neutral-800 shadow-md">
              {!imgError && ringtone.poster_url ? (
                <Image
                  src={ringtone.poster_url}
                  alt={ringtone.movie_name}
                  fill
                  className="object-cover"
                  sizes="64px"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-900 to-neutral-900">
                  <Music size={16} className="text-emerald-500/50 mb-1" />
                  <span className="text-[10px] font-bold text-emerald-500/50">{getInitials(ringtone.movie_name)}</span>
                </div>
              )}
            </div>
          </Link>
          
          {/* Play Overlay Button */}
          <button
            onClick={handlePlay}
            className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          >
             <div className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm ${isActive ? 'bg-emerald-500 text-neutral-900' : 'bg-neutral-900/80 text-white'}`}>
                {isActive ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
             </div>
          </button>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <Link href={`/ringtone/${ringtone.slug}`}>
            <h3 className={`font-bold text-base truncate leading-tight mb-1 ${isCurrent ? 'text-emerald-400' : 'text-zinc-100'}`}>
              {ringtone.title}
            </h3>
          </Link>
          
          <Link href={`/movie/${encodeURIComponent(ringtone.movie_name)}`} className="text-xs text-zinc-400 truncate hover:text-emerald-500 transition-colors w-fit mb-1.5">
            {ringtone.movie_name} <span className="text-zinc-600">({ringtone.movie_year})</span>
          </Link>

          <div className="flex flex-col gap-0.5">
            {ringtone.music_director && (
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                <Disc size={10} className="text-zinc-600 shrink-0" />
                <Link 
                  href={`/artist/${encodeURIComponent(ringtone.music_director)}`}
                  className="truncate hover:text-emerald-500 transition-colors"
                >
                  {ringtone.music_director}
                </Link>
              </div>
            )}
            {ringtone.movie_director && (
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                <Clapperboard size={10} className="text-zinc-600 shrink-0" />
                <Link 
                  href={`/director/${encodeURIComponent(ringtone.movie_director)}`}
                  className="truncate hover:text-emerald-500 transition-colors"
                >
                  {ringtone.movie_director}
                </Link>
              </div>
            )}
            {ringtone.singers && (
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                <Mic size={10} className="text-zinc-600 shrink-0" />
                <div className="flex flex-wrap gap-1 truncate">
                  {ringtone.singers.split(',').map((singer, idx) => (
                    <span key={idx} className="flex items-center">
                      <Link 
                        href={`/artist/${encodeURIComponent(singer.trim())}`}
                        className="hover:text-emerald-500 transition-colors"
                      >
                        {singer.trim()}
                      </Link>
                      {idx < ringtone.singers.split(',').length - 1 && <span className="mr-1">,</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Actions */}
      <div className="flex items-center justify-between px-3 py-2 bg-neutral-900 border-t border-neutral-800/50">
        {/* Tags (Scrollable) */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide px-1 max-w-[50%]">
          {ringtone.tags && ringtone.tags.length > 0 ? (
            ringtone.tags.map((tag, idx) => (
              <Link 
                key={idx} 
                href={`/mood/${tag}`}
                className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-800 text-zinc-400 border border-neutral-700 hover:border-emerald-500/50 hover:text-emerald-500 transition-colors whitespace-nowrap"
              >
                {tag}
              </Link>
            ))
          ) : (
             <span className="text-[10px] text-zinc-600 italic px-2">No tags</span>
          )}
        </div>

        {/* Actions: Like & Download */}
        <div className="flex items-center gap-2">
           <button 
             onClick={handleLike}
             className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${isLiked ? 'text-red-500' : 'text-zinc-400 hover:text-red-500'}`}
           >
             <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
             <span className="text-[10px] font-bold">{formatCount(likesCount)}</span>
           </button>

           <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-emerald-500/10 text-zinc-300 hover:text-emerald-500 border border-neutral-700 hover:border-emerald-500/50 transition-all text-[10px] font-bold uppercase tracking-wide"
          >
            {isDownloading ? (
              <span className="animate-pulse">...</span>
            ) : (
              <>
                <Download size={12} />
                {formatCount(ringtone.downloads)}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
