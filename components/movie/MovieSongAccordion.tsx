'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { SongGroup } from '@/lib/songGrouping';
import CompactRingtoneRow from './CompactRingtoneRow';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';

interface MovieSongAccordionProps {
  group: SongGroup;
  defaultExpanded?: boolean;
  forceExpanded?: boolean;
}

export default function MovieSongAccordion({
  group,
  defaultExpanded = false,
  forceExpanded = false,
}: MovieSongAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || forceExpanded);

  // If forceExpanded changes, sync state
  useEffect(() => {
    if (forceExpanded) {
      setIsExpanded(true);
    }
  }, [forceExpanded]);

  const handleToggleExpand = () => {
    hapticFeedback(hapticPatterns.selection);
    setIsExpanded((prev) => !prev);
  };

  const hiddenCutsCount = Math.max(0, group.cuts.length - 2);

  return (
    <section
      id={`song-${encodeURIComponent(group.songName.toLowerCase().replace(/\s+/g, '-'))}`}
      className="bg-m3-surface-container-low/60 dark:bg-m3-surface-container-low/40 rounded-2xl p-3 sm:p-4 border border-m3-outline-variant/30 shadow-2xs transition-all scroll-mt-28"
    >
      {/* Song Group Header */}
      <div
        onClick={group.cuts.length > 2 ? handleToggleExpand : undefined}
        className={`flex items-center justify-between gap-2 pb-2.5 mb-1 border-b border-m3-outline-variant/20 ${
          group.cuts.length > 2 ? 'cursor-pointer select-none group/header' : ''
        }`}
      >
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-m3-on-surface truncate leading-tight group-hover/header:text-m3-primary transition-colors">
            {group.songName}
          </h2>
          <p className="text-[11px] text-m3-outline font-medium">
            {group.cuts.length} {group.cuts.length === 1 ? 'ringtone cut' : 'ringtone cuts'}
            {group.totalDownloads > 0 && ` • ${(group.totalDownloads > 1000 ? `${(group.totalDownloads / 1000).toFixed(1)}k` : group.totalDownloads)} downloads`}
          </p>
        </div>

        {/* Accordion Toggle (Only if more than 2 cuts) */}
        {group.cuts.length > 2 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleExpand();
            }}
            aria-label={isExpanded ? `Collapse ${group.songName} cuts` : `Expand ${group.songName} cuts`}
            className="w-8 h-8 rounded-full flex items-center justify-center text-m3-outline hover:text-m3-on-surface hover:bg-m3-surface-container transition-all cursor-pointer"
          >
            <ChevronDown
              size={18}
              className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>

      {/* Track Rows Container */}
      <div className="space-y-1.5 pt-1">
        {/* We render ALL cuts in the DOM for SEO/AEO crawlers */}
        {group.cuts.map((cutItem, idx) => {
          const isCollapsedCut = !isExpanded && idx >= 2;
          return (
            <div
              key={cutItem.ringtone.id}
              className={isCollapsedCut ? 'hidden' : 'block animate-in fade-in duration-200'}
            >
              <CompactRingtoneRow
                ringtone={cutItem.ringtone}
                cleanTitle={cutItem.cleanCutTitle}
                trackNumber={idx + 1}
              />
            </div>
          );
        })}
      </div>

      {/* Expand / Collapse Button if more than 2 cuts */}
      {group.cuts.length > 2 && !forceExpanded && (
        <div className="mt-2 text-center pt-1">
          <button
            type="button"
            onClick={handleToggleExpand}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-m3-primary hover:bg-m3-primary/10 transition-colors cursor-pointer"
          >
            <span>
              {isExpanded ? 'Show less cuts' : `+ Show ${hiddenCutsCount} more cuts`}
            </span>
            <ChevronDown
              size={13}
              className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      )}
    </section>
  );
}
