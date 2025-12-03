'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, Grid, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800 z-50 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        <Link href="/" className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-emerald-500' : 'text-zinc-500'}`}>
          <Home size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        
        <Link href="/search" className={`flex flex-col items-center gap-1 ${isActive('/search') ? 'text-emerald-500' : 'text-zinc-500'}`}>
          <Search size={24} strokeWidth={isActive('/search') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Search</span>
        </Link>

        <Link href="/upload" className="flex flex-col items-center gap-1 -mt-6">
          <div className={`p-3 rounded-full ${isActive('/upload') ? 'bg-emerald-500 text-neutral-900' : 'bg-neutral-800 text-emerald-500 border border-neutral-700'}`}>
            <PlusCircle size={28} strokeWidth={2.5} />
          </div>
          <span className={`text-[10px] font-medium ${isActive('/upload') ? 'text-emerald-500' : 'text-zinc-500'}`}>Upload</span>
        </Link>

        <Link href="/categories" className={`flex flex-col items-center gap-1 ${isActive('/categories') ? 'text-emerald-500' : 'text-zinc-500'}`}>
          <Grid size={24} strokeWidth={isActive('/categories') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Browse</span>
        </Link>

        <Link href="/profile" className={`flex flex-col items-center gap-1 ${isActive('/profile') ? 'text-emerald-500' : 'text-zinc-500'}`}>
          <User size={24} strokeWidth={isActive('/profile') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>
    </div>
  );
}
