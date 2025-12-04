'use client';

import { useState } from 'react';
import { ArrowLeft, Flame, Users } from 'lucide-react';
import Link from 'next/link';
import ImageWithFallback from './ImageWithFallback';
import RippleWrapper from './Ripple';
import confetti from 'canvas-confetti';
import FavoriteButton from './FavoriteButton';

interface ProfileHeaderProps {
  name: string;
  type: 'Actor' | 'Singer' | 'Music Director';
  ringtoneCount: number;
  imageUrl?: string;
}

export default function ProfileHeader({ name, type, ringtoneCount, imageUrl }: ProfileHeaderProps) {
  
  const [isFan, setIsFan] = useState(false);

  const handleJoinFanClub = () => {
    if (!isFan) {
      // Becoming a fan
      setIsFan(true);
      
      // Trigger Confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#fbbf24', '#f59e0b'] // Emerald, Amber, Orange
      });
    } else {
      // Leaving fan club
      setIsFan(false);
    }
  };

  const href = type === 'Actor' 
    ? `/actor/${encodeURIComponent(name)}` 
    : `/artist/${encodeURIComponent(name)}`;

  return (
    <div className="relative bg-neutral-900 border-b border-neutral-800 pb-6">
      {/* Back Button */}
      <Link href="/" className="absolute top-4 left-4 z-10 p-2 bg-black/20 backdrop-blur-md rounded-full text-zinc-100 hover:bg-black/40 transition-colors">
        <ArrowLeft size={20} />
      </Link>

      {/* Favorite Button */}
      <div className="absolute top-4 right-4 z-10">
        <FavoriteButton 
          item={{ id: name, name, type, imageUrl, href }} 
          className="w-10 h-10 bg-black/20 backdrop-blur-md hover:bg-black/40"
        />
      </div>

      {/* Banner / Background (Optional - using gradient for now) */}
      <div className="h-32 w-full bg-gradient-to-b from-emerald-900/20 to-neutral-900" />

      <div className="px-6 -mt-12 flex flex-col items-center">
        {/* Avatar */}
        <div className="relative w-28 h-28 rounded-full border-4 border-neutral-900 shadow-xl shadow-black/50 overflow-hidden mb-4">
          <ImageWithFallback 
            src={imageUrl} 
            alt={name} 
            className="object-cover"
            fallbackClassName="bg-neutral-800 text-zinc-500"
          />
        </div>

        {/* Info Card with Glassmorphism */}
        <div className="w-full max-w-xs bg-neutral-800/30 backdrop-blur-md border border-white/5 rounded-2xl p-4 mb-6 flex flex-col items-center shadow-xl shadow-black/20">
          <h1 className="text-2xl font-bold text-white text-center mb-1 drop-shadow-md">{name}</h1>
          <p className="text-zinc-400 text-xs uppercase tracking-wider font-bold mb-3">{type} • {ringtoneCount} Ringtones</p>
        </div>

        {/* Join Fan Club Button */}
        <RippleWrapper
          onClick={handleJoinFanClub}
          className={`
            relative w-full max-w-xs py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer
            ${isFan 
              ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-lg shadow-orange-500/20 scale-[1.02]' 
              : 'bg-transparent border border-emerald-500 text-emerald-500 hover:bg-emerald-500/10'
            }
          `}
        >
          {isFan ? (
            <>
              <Users size={18} fill="currentColor" />
              <span>Fan Club Member</span>
            </>
          ) : (
            <>
              <span>Join Fan Club</span>
            </>
          )}
        </RippleWrapper>
      </div>
    </div>
  );
}
