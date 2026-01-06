'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Search, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-t border-zinc-200 dark:border-neutral-800 z-[100] pb-safe transition-colors duration-300">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-6">
        {/* Home */}
        <Link href="/" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/') ? 'text-emerald-500' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}>
          <Home size={22} strokeWidth={isActive('/') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">{t('home')}</span>
        </Link>

        {/* Browse */}
        <Link href="/categories" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/categories') ? 'text-emerald-500' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}>
          <Search size={22} strokeWidth={isActive('/categories') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">{t('search')}</span>
        </Link>

        {/* Requests */}
        <Link href="/requests" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/requests') ? 'text-emerald-500' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}>
          <MessageSquare size={22} strokeWidth={isActive('/requests') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">{t('requests')}</span>
        </Link>

        {/* Profile */}
        <Link href="/profile" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/profile') ? 'text-emerald-500' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}>
          <User size={22} strokeWidth={isActive('/profile') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">{t('profile')}</span>
        </Link>
      </div>
    </div>
  );
}
