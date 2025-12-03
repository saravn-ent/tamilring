'use client';

import RingtoneCard from '@/components/RingtoneCard';
import { Ringtone } from '@/types';

export default function ClientFeed({ ringtones }: { ringtones: Ringtone[] }) {
  return (
    <div className="space-y-4">
      {ringtones.map((ringtone) => (
        <RingtoneCard 
          key={ringtone.id} 
          ringtone={ringtone} 
        />
      ))}
    </div>
  );
}
