'use client';

import { usePlayer } from '@/context/PlayerContext';
import { Ringtone } from '@/types';
import { Play, Pause } from 'lucide-react';

export default function PlayButton({ ringtone }: { ringtone: Ringtone }) {
  const { currentRingtone, isPlaying, playRingtone } = usePlayer();
  const isCurrent = currentRingtone?.id === ringtone.id;
  const playing = isCurrent && isPlaying;

  return (
    <button
      onClick={() => playRingtone(ringtone)}
      className={`flex-1 font-normal py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 border ${playing
          ? 'bg-brand-accent/5 border-brand-accent text-brand-accent'
          : 'bg-brand-wash border-brand-border text-black hover:bg-white'
        }`}
    >
      {playing ? (
        <Pause size={18} strokeWidth={1.5} className="animate-pulse" />
      ) : (
        <Play size={18} strokeWidth={1.5} />
      )}
      <span className="text-sm">{playing ? 'Pause' : 'Play'}</span>
    </button>
  );
}
