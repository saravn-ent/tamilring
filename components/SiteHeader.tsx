'use client';

import Link from 'next/link';
import { Scissors } from 'lucide-react';

// Force HMR invalidation - Cache Clear - Fix Hydration V2
export default function SiteHeader() {
  return (
    <div suppressHydrationWarning className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-brand-gray transition-colors duration-300">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tighter text-brand-blue">
          <span>Tamil</span><span className="text-brand-dark">Ring</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link href="/trim" className="p-2 text-zinc-400 hover:text-brand-blue transition-colors" aria-label="Ringtone Cutter">
            <Scissors size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}
