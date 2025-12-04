'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { Ringtone } from '@/types';

interface HeroSliderProps {
  ringtones: Ringtone[];
  movieName?: string;
  totalLikes?: number;
}

export default function HeroSlider({ ringtones, movieName, totalLikes }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % ringtones.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + ringtones.length) % ringtones.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  if (!ringtones || ringtones.length === 0) return null;

  return (
    <div
      className="relative w-full h-[280px] mb-4 flex items-center justify-center overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Blur of Current */}
      <div className="absolute inset-0 z-0">
        {ringtones[currentIndex].poster_url && (
          <Image
            src={ringtones[currentIndex].poster_url}
            alt="bg"
            fill
            className="object-cover blur-3xl opacity-20 scale-150 transition-all duration-700"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505]" />
      </div>

      <div className="relative w-52 h-64 perspective-1000">
        {ringtones.map((ringtone, idx) => {
          // Determine position logic
          let positionClass = "z-0 opacity-0 scale-90 translate-x-12 pointer-events-none";

          if (idx === currentIndex) {
            positionClass = "z-30 opacity-100 scale-100 translate-x-0 shadow-2xl shadow-black/50";
          } else if (idx === (currentIndex + 1) % ringtones.length) {
            positionClass = "z-20 opacity-60 scale-90 translate-x-8 translate-y-4 rotate-3 cursor-pointer hover:opacity-80";
          } else if (idx === (currentIndex + 2) % ringtones.length) {
            positionClass = "z-10 opacity-30 scale-85 translate-x-16 translate-y-8 rotate-6 pointer-events-none";
          }

          return (
            <div
              key={ringtone.id}
              className={`absolute top-0 left-0 w-full h-full rounded-2xl transition-all duration-500 ease-out origin-bottom ${positionClass}`}
              onClick={() => {
                if (idx === (currentIndex + 1) % ringtones.length) handleNext();
              }}
            >
              {/* Card Content */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-neutral-800 border border-white/10">
                {ringtone.poster_url ? (
                  <Image src={ringtone.poster_url} alt={ringtone.title} fill className="object-cover" priority={idx === currentIndex} />
                ) : (
                  <div className="w-full h-full bg-neutral-800" />
                )}

                {/* Overlay (Only visible on active card) */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent transition-opacity duration-300 ${idx === currentIndex ? 'opacity-100' : 'opacity-60'}`}>
                  <div className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${idx === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    <span className="inline-block px-2 py-0.5 bg-emerald-500 text-black text-[10px] font-bold rounded mb-2 shadow-lg shadow-emerald-500/20">
                      {movieName ? `MOST LIKED MOVIE • ${totalLikes?.toLocaleString()} ❤️` : `TOP RINGTONE #${idx + 1}`}
                    </span>
                    <h2 className="text-xl font-bold text-white leading-none mb-1 drop-shadow-md">{ringtone.movie_name}</h2>
                    <p className="text-zinc-300 text-xs mb-3 line-clamp-1 drop-shadow-sm">{ringtone.title}</p>

                    <div className="flex gap-2">
                      <Link
                        href={`/ringtone/${ringtone.slug}`}
                        className="flex-1 bg-white text-black py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 hover:bg-zinc-200 transition-colors shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Play size={12} fill="currentColor" /> Play
                      </Link>
                      <Link
                        href={`/movie/${encodeURIComponent(ringtone.movie_name)}`}
                        className="px-3 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold hover:bg-white/20 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Album
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Indicators */}
      <div className="absolute bottom-2 flex gap-1.5 z-20">
        {ringtones.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-emerald-500' : 'w-1.5 bg-zinc-700'}`}
          />
        ))}
      </div>
    </div>
  );
}
