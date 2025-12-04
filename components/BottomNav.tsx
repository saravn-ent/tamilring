'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Plus } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-white/10 z-50 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-6">
        {/* Home */}
        <Link href="/" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/') ? 'text-emerald-500' : 'text-zinc-500 hover:text-zinc-300'}`}>
          <Home size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        {/* Upload - Prominent Center Button */}
        <Link
          href="/upload"
          className="flex items-center justify-center w-14 h-14 bg-emerald-500 rounded-full text-black shadow-lg shadow-emerald-500/25 -mt-8 border-4 border-black transition-transform active:scale-95"
        >
          <Plus size={28} strokeWidth={2.5} />
        </Link>

        {/* Profile */}
        <Link href="/profile" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/profile') ? 'text-emerald-500' : 'text-zinc-500 hover:text-zinc-300'}`}>
          <User size={24} strokeWidth={isActive('/profile') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>
    </div>
  );
}
