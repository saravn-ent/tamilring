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
    <div className="flex justify-end px-4 py-1 transition-all">
      <div className="relative" ref={dropdownRef}>
        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 flex items-center gap-2 px-4 rounded-full bg-white border border-brand-border text-xs font-bold text-zinc-600 hover:bg-brand-wash hover:text-brand-dark transition-all shadow-sm hover:shadow-md hover:border-brand-accent/30"
        >
          Sort: <span className="text-brand-accent">{currentLabel}</span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Compact Dropdown */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-brand-border rounded-xl shadow-xl shadow-brand-dark/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
            {/* Scrollable Container */}
            <div className="max-h-[200px] overflow-y-auto scrollbar-thin">
              {SORT_OPTIONS.map((option, idx) => (
                <button
                  key={option.value}
                  onClick={() => handleSort(option.value)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${currentSort === option.value
                    ? 'bg-brand-wash text-brand-accent'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-brand-dark'
                    } ${idx !== SORT_OPTIONS.length - 1 ? 'border-b border-brand-wash' : ''}`}
                >
                  <span>{option.label}</span>
                  {currentSort === option.value && (
                    <Check size={16} className="text-brand-accent" />
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
