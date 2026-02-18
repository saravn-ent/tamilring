'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Music } from 'lucide-react';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  fallbackAlt?: string; // Add this prop
  className?: string;
  fallbackClassName?: string;
  showIcon?: boolean;
  fill?: boolean;
  fallbackText?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  loading?: 'lazy' | 'eager';
}

export default function ImageWithFallback({
  src,
  alt,
  fallbackAlt,
  className = "object-cover",
  fallbackClassName = "bg-neutral-800 text-zinc-400",
  showIcon = false,
  fill = true,
  fallbackText,
  sizes,
  priority = false,
  quality = 75,
  loading,
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  // If src changed, reset error state
  if (src !== prevSrc) {
    setPrevSrc(src);
    setError(false);
  }

  const getInitials = (name: string) => {
    return name
      ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
      : 'TR';
  };

  if (error || !src) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center ${fallbackClassName}`}>
        {showIcon && <Music size={20} className="mb-1 opacity-50" />}
        <span className="font-bold text-xs opacity-70">{fallbackText || getInitials(fallbackAlt || alt)}</span>
      </div>
    );
  }

  const isExternal = src?.startsWith('http');

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      quality={quality}
      loading={loading || (priority ? 'eager' : 'lazy')}
      className={className}
      unoptimized={isExternal}
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2UwZTBlMCIvPjwvc3ZnPg=="
      onError={() => setError(true)}
    />
  );
}

