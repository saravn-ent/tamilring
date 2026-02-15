'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { hapticFeedback } from '@/lib/haptics';

export default function PullToRefresh({ children }: { children: React.ReactNode }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const startY = useRef(0);
  const router = useRouter();

  const PULL_THRESHOLD = 80;
  const MAX_PULL = 150;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Only trigger if we are at the top of the page
    if (window.scrollY <= 0) {
      startY.current = e.touches[0].pageY;
      setIsInteracting(true);
    } else {
      setIsInteracting(false);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isInteracting || isRefreshing) return;

    const currentY = e.touches[0].pageY;
    const diff = currentY - startY.current;

    // Only pull down
    if (diff > 0) {
      // Resistance effect: move less than the actual swipe
      const distance = Math.min(MAX_PULL, diff * 0.4);
      setPullDistance(distance);
      
      // Prevent browser default refresh/overscroll behavior when we've started a real pull
      if (distance > 15 && e.cancelable) {
        e.preventDefault();
      }

      // Haptic nudge when crossing threshold
      if (distance >= PULL_THRESHOLD && pullDistance < PULL_THRESHOLD) {
        hapticFeedback(15);
      }
    } else {
      setIsInteracting(false);
      setPullDistance(0);
    }
  }, [isInteracting, isRefreshing, pullDistance]);

  const handleTouchEnd = useCallback(() => {
    if (!isInteracting) return;
    setIsInteracting(false);

    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      hapticFeedback(25);
      
      // Trigger Next.js refresh to re-fetch Server Components
      router.refresh();
      
      // Keep showing refresh for at least 1 second for visual feedback
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      }, 1200);
    } else {
      setPullDistance(0);
    }
  }, [isInteracting, pullDistance, router]);

  useEffect(() => {
    // We use global listeners because children might handle their own touches
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Visual Indicator Layer */}
      <div 
        className="fixed left-0 right-0 flex justify-center pointer-events-none z-100"
        style={{ 
          top: isRefreshing ? '80px' : `${pullDistance + 40}px`,
          opacity: Math.min(1, pullDistance / 40),
          transform: `translateY(-50%) scale(${Math.min(1, pullDistance / PULL_THRESHOLD)})`,
          transition: isRefreshing ? 'top 0.3s ease-out' : 'none'
        }}
      >
        <div className="bg-white/90 backdrop-blur-md rounded-full p-2.5 shadow-xl border border-zinc-200 text-brand-blue ring-4 ring-brand-blue/5">
          <RefreshCw 
            size={22} 
            className={`${isRefreshing ? 'animate-spin' : ''}`}
            style={{ 
              transform: isRefreshing ? undefined : `rotate(${pullDistance * 3}deg)`
            }}
          />
        </div>
      </div>

      {/* Content Layer with Push Down */}
      <div 
        className="min-h-screen"
        style={{ 
          transform: `translateY(${isRefreshing ? 60 : pullDistance * 0.5}px)`,
          transition: isRefreshing || (pullDistance === 0 && !isInteracting) ? 'transform 0.4s cubic-bezier(0.19, 1, 0.22, 1)' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
}
