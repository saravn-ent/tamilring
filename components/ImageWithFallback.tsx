'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Music } from 'lucide-react';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  showIcon?: boolean;
}

export default function ImageWithFallback({ 
  src, 
  alt, 
  className = "object-cover", 
  fallbackClassName = "bg-neutral-800 text-zinc-400",
  showIcon = false 
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

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
        <span className="font-bold text-xs opacity-70">{getInitials(alt)}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      onError={() => setError(true)}
      unoptimized
    />
  );
}
