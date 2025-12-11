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
      className="flex-1 bg-emerald-500 text-neutral-900 font-medium py-4 rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
    >
      {playing ? <Pause size={20} /> : <Play size={20} />}
      {playing ? 'Pause' : 'Play'}
    </button>
  );
}
