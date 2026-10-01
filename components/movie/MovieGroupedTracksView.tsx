'use client';

import React from 'react';
import { SongGroup } from '@/lib/songGrouping';
import MovieSongAccordion from './MovieSongAccordion';

interface MovieGroupedTracksViewProps {
  groups: SongGroup[];
  movieName: string;
}

export default function MovieGroupedTracksView({
  groups,
}: MovieGroupedTracksViewProps) {
  return (
    <div className="space-y-3 sm:space-y-3.5">
      {groups.map((group) => (
        <MovieSongAccordion
          key={group.songName}
          group={group}
          defaultExpanded={groups.length === 1 || group.cuts.length <= 2}
        />
      ))}
    </div>
  );
}

