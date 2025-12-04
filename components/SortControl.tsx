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
  const [currentSort, setCurrentSort] = useState('recent');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sort = searchParams.get('sort');
    if (sort) {
      setCurrentSort(sort);
    }
  }, [searchParams]);

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
    <div className="flex justify-end px-4 py-2 bg-neutral-900/95 backdrop-blur-md border-b border-white/5 transition-all">
      <div className="relative" ref={dropdownRef}>
        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800/50 border border-white/10 backdrop-blur-md text-xs font-bold text-zinc-300 hover:bg-neutral-700 hover:text-white transition-all shadow-lg shadow-black/20"
        >
          Sort: <span className="text-emerald-400">{currentLabel}</span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Compact Dropdown */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl shadow-black/40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Scrollable Container */}
            <div className="max-h-[200px] overflow-y-auto scrollbar-thin">
              {SORT_OPTIONS.map((option, idx) => (
                <button
                  key={option.value}
                  onClick={() => handleSort(option.value)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${currentSort === option.value
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'text-zinc-300 hover:bg-neutral-800'
                    } ${idx !== SORT_OPTIONS.length - 1 ? 'border-b border-white/5' : ''}`}
                >
                  <span>{option.label}</span>
                  {currentSort === option.value && (
                    <Check size={16} className="text-emerald-500" />
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
