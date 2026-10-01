'use client';

import React, { forwardRef } from 'react';
import { Search, X, Loader2, ArrowLeft } from 'lucide-react';

export interface M3SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  loading?: boolean;
  leadingIcon?: React.ReactNode;
  trailingActions?: React.ReactNode;
  containerClassName?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const M3SearchBar = forwardRef<HTMLInputElement, M3SearchBarProps>(
  (
    {
      value,
      onChange,
      onClear,
      loading = false,
      leadingIcon,
      trailingActions,
      className = '',
      containerClassName = '',
      placeholder = 'Search songs, artists, BGM, movies...',
      showBackButton = false,
      onBack,
      ...props
    },
    ref
  ) => {
    const hasValue = typeof value === 'string' ? value.length > 0 : Boolean(value);

    return (
      <div
        className={`relative flex items-center w-full h-14 rounded-full bg-m3-surface-container-high border border-m3-outline-variant/30 text-m3-on-surface shadow-xs hover:shadow-sm focus-within:shadow-md focus-within:bg-m3-surface-container-highest transition-all duration-200 px-3.5 sm:px-4 gap-2.5 sm:gap-3 group ${containerClassName}`}
      >
        {/* Leading Slot: Back Arrow or Search Icon */}
        {showBackButton ? (
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 -ml-1 rounded-full flex items-center justify-center text-m3-on-surface hover:text-m3-primary hover:bg-m3-on-surface/8 active:scale-90 transition-all cursor-pointer shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
        ) : (
          <div className="text-m3-on-surface-variant group-focus-within:text-m3-primary transition-colors shrink-0 flex items-center justify-center w-8 h-8">
            {leadingIcon || <Search size={20} />}
          </div>
        )}

        {/* Pure M3 Input with zero focus borders/rings */}
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{ outline: 'none', boxShadow: 'none', border: 'none' }}
          className={`w-full h-full bg-transparent border-0 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 text-base text-m3-on-surface placeholder:text-m3-outline/70 font-normal leading-normal ${className}`}
          {...props}
        />

        {/* Trailing Controls: Spinner / Clear button / Custom trailing actions */}
        <div className="flex items-center gap-1 shrink-0">
          {loading && (
            <Loader2 size={18} className="animate-spin text-m3-primary shrink-0" />
          )}

          {hasValue && onClear && !loading && (
            <button
              type="button"
              onClick={onClear}
              className="w-8 h-8 rounded-full flex items-center justify-center text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-on-surface/8 active:scale-90 transition-all cursor-pointer"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}

          {trailingActions}
        </div>
      </div>
    );
  }
);

M3SearchBar.displayName = 'M3SearchBar';

export default M3SearchBar;
