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
    <div className="relative bg-m3-surface-container-low border-b border-m3-outline-variant/30 pb-6 transition-colors duration-300">
      {/* Back Button */}
      <Link href="/" className="absolute top-4 left-4 z-10 p-2 bg-m3-surface/80 backdrop-blur-md rounded-full text-m3-on-surface hover:bg-m3-surface border border-m3-outline-variant/40 transition-colors shadow-xs">
        <ArrowLeft size={18} />
      </Link>

      {/* Favorite Button */}
      <div className="absolute top-4 right-4 z-10">
        <FavoriteButton
          item={{ id: name, name, type, imageUrl, href }}
          className="w-9 h-9 bg-m3-surface/80 backdrop-blur-md hover:bg-m3-surface border border-m3-outline-variant/40 text-m3-on-surface shadow-xs"
        />
      </div>

      {/* Banner / Gradient Wash */}
      <div className="h-32 w-full bg-linear-to-b from-m3-primary/15 via-m3-surface-container to-m3-surface-container-low" />

      <div className="px-6 -mt-12 flex flex-col items-center">
        {/* Avatar */}
        <div className="relative w-28 h-28 rounded-full border-4 border-m3-surface shadow-xl overflow-hidden mb-4 bg-m3-surface-container">
          <ImageWithFallback
            src={imageUrl}
            alt={name}
            className="object-cover"
            fallbackClassName="bg-m3-surface-container text-m3-outline"
          />
        </div>

        {/* Info Card with Glassmorphism */}
        <div className="w-full max-w-xs bg-m3-surface-container/90 backdrop-blur-md border border-m3-outline-variant/40 rounded-2xl p-4 mb-5 flex flex-col items-center shadow-md">
          <h1 className="text-2xl font-display font-extrabold text-m3-on-surface text-center mb-1">{name}</h1>
          <p className="text-m3-primary text-xs uppercase tracking-wider font-bold mb-2">{type}</p>
        </div>

        {/* Join Fan Club Button */}
        <RippleWrapper
          onClick={handleJoinFanClub}
          className={`
            relative w-full max-w-xs py-3 rounded-full font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95
            ${isFan
              ? 'bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20 scale-[1.02]'
              : 'bg-m3-primary text-m3-on-primary hover:bg-m3-primary/90'
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
              <Flame size={18} />
              <span>Join Fan Club</span>
            </>
          )}
        </RippleWrapper>
      </div>
    </div>
  );
}
