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
  imageUrl?: string;
}

export default function ProfileHeader({ name, type, imageUrl }: ProfileHeaderProps) {

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
    <div className="relative bg-white border-b border-brand-gray/50 pb-6 transition-colors duration-300">
      {/* Back Button */}
      <Link href="/" className="absolute top-4 left-4 z-10 p-2 bg-white/50 backdrop-blur-md rounded-full text-zinc-600 hover:bg-white/80 border border-brand-gray/50 transition-colors shadow-sm">
        <ArrowLeft size={20} />
      </Link>

      {/* Favorite Button */}
      <div className="absolute top-4 right-4 z-10">
        <FavoriteButton
          item={{ id: name, name, type, imageUrl, href }}
          className="w-10 h-10 bg-white/50 backdrop-blur-md hover:bg-white/80 border border-brand-gray/50 text-zinc-600 shadow-sm"
        />
      </div>

      {/* Banner / Background */}
      <div className="h-32 w-full bg-gradient-to-b from-brand-wash to-white" />

      <div className="px-6 -mt-12 flex flex-col items-center">
        {/* Avatar */}
        <div className="relative w-28 h-28 rounded-full border-4 border-white shadow-xl shadow-brand-dark/5 overflow-hidden mb-4 bg-white">
          <ImageWithFallback
            src={imageUrl}
            alt={name}
            className="object-cover"
            fallbackClassName="bg-brand-wash text-zinc-400"
          />
        </div>

        {/* Info Card with Glassmorphism */}
        <div className="w-full max-w-xs bg-white/80 backdrop-blur-md border border-brand-gray rounded-2xl p-4 mb-6 flex flex-col items-center shadow-lg shadow-brand-dark/5">
          <h1 className="text-2xl font-bold text-black text-center mb-1 drop-shadow-sm">{name}</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mb-3">{type}</p>
        </div>

        {/* Join Fan Club Button */}
        <RippleWrapper
          onClick={handleJoinFanClub}
          className={`
            relative w-full max-w-xs py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer
            ${isFan
              ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-lg shadow-orange-500/20 scale-[1.02]'
              : 'bg-white border border-brand-accent text-brand-accent hover:bg-brand-accent/5 shadow-sm'
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
