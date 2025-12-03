'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, Check, X } from 'lucide-react';

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

  useEffect(() => {
    const sort = searchParams.get('sort');
    if (sort) {
      setCurrentSort(sort);
    }
  }, [searchParams]);

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    router.push(`?${params.toString()}`);
    setIsOpen(false);
  };

  const currentLabel = SORT_OPTIONS.find(opt => opt.value === currentSort)?.label || 'Recently Added';

  return (
    <>
      {/* Trigger Button - Sticky Header */}
      <div className="sticky top-14 z-30 flex justify-end px-4 py-2 bg-neutral-900/80 backdrop-blur-md border-b border-white/5 -mx-4 mb-4 transition-all">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800/50 border border-white/10 backdrop-blur-md text-xs font-bold text-zinc-300 hover:bg-neutral-700 hover:text-white transition-all shadow-lg shadow-black/20"
        >
          Sort: <span className="text-emerald-400">{currentLabel}</span>
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Bottom Sheet Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Sheet */}
          <div className="relative w-full max-w-md bg-neutral-900 border-t border-white/10 rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Sort Ringtones</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full bg-neutral-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSort(option.value)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                    currentSort === option.value 
                      ? 'bg-emerald-500/10 border border-emerald-500/50 text-emerald-400' 
                      : 'bg-neutral-800/50 border border-white/5 text-zinc-300 hover:bg-neutral-800'
                  }`}
                >
                  <span className="font-medium">{option.label}</span>
                  {currentSort === option.value && (
                    <Check size={18} className="text-emerald-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
