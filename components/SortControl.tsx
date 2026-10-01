'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, Check } from 'lucide-react';

const SORT_OPTIONS = [
  { label: 'Recently Added', value: 'recent' },
  { label: 'Most Downloaded', value: 'downloads' },
  { label: 'Most Liked', value: 'likes' },
  { label: 'Year: Newest', value: 'year_desc' },
  { label: 'Year: Oldest', value: 'year_asc' },
];

export default function SortControl() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentSort = searchParams.get('sort') || 'recent';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    router.push(`?${params.toString()}`);
    setIsOpen(false);
  };

  const currentLabel = SORT_OPTIONS.find(opt => opt.value === currentSort)?.label || 'Recently Added';

  return (
    <div className="flex justify-end px-4 py-1 transition-all">
      <div className="relative" ref={dropdownRef}>
        {/* M3 Assist Chip Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 flex items-center gap-1.5 px-3.5 rounded-full bg-m3-surface-container-low border border-m3-outline-variant/60 text-xs font-semibold text-m3-on-surface hover:bg-m3-surface-container transition-all cursor-pointer shadow-2xs"
        >
          <span>Sort:</span> <span className="text-m3-primary font-bold">{currentLabel}</span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 text-m3-outline ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* M3 Menu Container */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-m3-surface-container-high border border-m3-outline-variant/40 rounded-2xl m3-elevation-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50 p-1">
            {/* Scrollable Container */}
            <div className="max-h-[220px] overflow-y-auto scrollbar-thin divide-y divide-m3-outline-variant/20">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSort(option.value)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium rounded-xl transition-colors cursor-pointer ${
                    currentSort === option.value
                      ? 'bg-m3-secondary-container text-m3-on-secondary-container font-bold'
                      : 'text-m3-on-surface hover:bg-m3-surface-container'
                  }`}
                >
                  <span>{option.label}</span>
                  {currentSort === option.value && (
                    <Check size={15} className="text-m3-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

