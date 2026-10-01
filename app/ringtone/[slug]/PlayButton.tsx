'use client';

import { usePlayer } from '@/context/PlayerContext';
import { Ringtone } from '@/types';
import { Play, Pause } from 'lucide-react';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';

export default function PlayButton({ ringtone }: { ringtone: Ringtone }) {
  const { currentRingtone, isPlaying, playRingtone, togglePlay } = usePlayer();
  const isCurrent = currentRingtone?.id === ringtone.id;
  const playing = isCurrent && isPlaying;

  const handleClick = () => {
    hapticFeedback(hapticPatterns.impact);
    if (isCurrent) {
      togglePlay();
    } else {
      playRingtone(ringtone);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex-1 w-full h-10 px-4 rounded-full transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 cursor-pointer font-semibold text-xs sm:text-sm shadow-xs ${
        playing
          ? 'bg-m3-primary text-m3-on-primary ring-2 ring-m3-primary/30'
          : 'bg-m3-surface-container-high text-m3-on-surface hover:bg-m3-surface-container border border-m3-outline-variant/50'
      }`}
      aria-label={playing ? `Pause ${ringtone.title}` : `Play ${ringtone.title}`}
    >
      {playing ? (
        <Pause size={16} fill="currentColor" />
      ) : (
        <Play size={16} fill="currentColor" className="ml-0.5" />
      )}
      <span>{playing ? 'Pause' : 'Play Preview'}</span>
    </button>
  );
}
