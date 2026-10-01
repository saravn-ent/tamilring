'use client';

import React, { useRef } from 'react';
import { Music, Disc3 } from 'lucide-react';

interface SongFilterChipsProps {
  songs: Array<{ name: string; count: number }>;
  selectedSong: string;
  onSelectSong: (song: string) => void;
  totalCount: number;
}

export default function SongFilterChips({
  songs,
  selectedSong,
  onSelectSong,
  totalCount,
}: SongFilterChipsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleChipClick = (songName: string, e: React.MouseEvent<HTMLButtonElement>) => {
    onSelectSong(songName);
    
    // Auto center clicked chip in horizontal scroll container
    const chip = e.currentTarget;
    const container = scrollContainerRef.current;
    if (container) {
      const chipOffset = chip.offsetLeft - container.offsetLeft;
      const chipCenter = chipOffset - (container.clientWidth / 2) + (chip.clientWidth / 2);
      container.scrollTo({
        left: chipCenter,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5"
        role="tablist"
        aria-label="Filter ringtones by song"
      >
        {/* 'All' Chip */}
        <button
          type="button"
          role="tab"
          aria-selected={selectedSong === 'all'}
          onClick={(e) => handleChipClick('all', e)}
          className={`shrink-0 h-8 px-3.5 rounded-full text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer shadow-2xs ${
            selectedSong === 'all'
              ? 'bg-m3-primary text-m3-on-primary font-bold shadow-xs scale-[1.02]'
              : 'bg-m3-surface-container-low text-m3-on-surface-variant hover:bg-m3-surface-container border border-m3-outline-variant/30'
          }`}
        >
          <Disc3 size={13} className={selectedSong === 'all' ? 'animate-spin-slow' : 'opacity-70'} />
          <span>All Tracks</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            selectedSong === 'all' ? 'bg-white/20 text-white' : 'bg-m3-surface-container-high text-m3-outline'
          }`}>
            {totalCount}
          </span>
        </button>

        {/* Individual Song Chips */}
        {songs.map((song) => {
          const isSelected = selectedSong.toLowerCase() === song.name.toLowerCase();
          return (
            <button
              key={song.name}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={(e) => handleChipClick(song.name, e)}
              className={`shrink-0 h-8 px-3.5 rounded-full text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap ${
                isSelected
                  ? 'bg-m3-primary text-m3-on-primary font-bold shadow-xs scale-[1.02]'
                  : 'bg-m3-surface-container-low text-m3-on-surface-variant hover:bg-m3-surface-container border border-m3-outline-variant/30'
              }`}
            >
              <Music size={12} className={isSelected ? 'text-white' : 'opacity-60'} />
              <span>{song.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isSelected ? 'bg-white/20 text-white' : 'bg-m3-surface-container-high text-m3-outline'
              }`}>
                {song.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
