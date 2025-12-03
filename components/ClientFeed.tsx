'use client';

import RingtoneCard from '@/components/RingtoneCard';
import { Ringtone } from '@/types';
import { usePlayer } from '@/context/PlayerContext';

export default function ClientFeed({ ringtones }: { ringtones: Ringtone[] }) {
  const { playRingtone } = usePlayer();

  return (
    <div className="space-y-4">
      {ringtones.map((ringtone) => (
        <RingtoneCard 
          key={ringtone.id} 
          ringtone={ringtone} 
          onPlay={playRingtone} 
        />
      ))}
    </div>
  );
}
