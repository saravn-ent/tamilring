'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { Ringtone } from '@/types';

interface RingtoneCardProps {
  ringtone: Ringtone;
  onPlay: (ringtone: Ringtone) => void;
}

export default function RingtoneCard({ ringtone, onPlay }: RingtoneCardProps) {
  return (
    <div className="flex items-center bg-neutral-800 p-3 rounded-xl gap-4 shadow-md hover:bg-neutral-700 transition-colors group">
      {/* Movie Poster */}
      <Link href={`/ringtone/${ringtone.slug}`} className="shrink-0">
        <div className="relative w-16 h-24 rounded-lg overflow-hidden">
          <Image
            src={ringtone.poster_url || '/placeholder.png'}
            alt={ringtone.movie_name}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/ringtone/${ringtone.slug}`}>
          <h3 className="text-zinc-100 font-bold text-lg truncate leading-tight">
            {ringtone.title}
          </h3>
          <p className="text-zinc-400 text-sm truncate">
            {ringtone.movie_name} <span className="text-zinc-600">({ringtone.movie_year})</span>
          </p>
          <p className="text-zinc-500 text-xs truncate mt-1">
            {ringtone.singers}
          </p>
        </Link>
      </div>

      {/* Play Button */}
      <button
        onClick={() => onPlay(ringtone)}
        className="shrink-0 w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-neutral-900 hover:bg-emerald-400 hover:scale-105 transition-all shadow-lg shadow-emerald-500/20"
        aria-label="Play"
      >
        <Play size={20} fill="currentColor" />
      </button>
    </div>
  );
}
