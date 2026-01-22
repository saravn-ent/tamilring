'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, MessageSquare, Scissors } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const isActive = (path: string) => pathname === path;

  return (
    <div suppressHydrationWarning className="bottom-nav-fixed fixed bottom-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-md border-t border-brand-gray pb-safe transition-colors duration-300 md:hidden">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-6">
        {/* Home */}
        <Link suppressHydrationWarning href="/" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/') ? 'text-brand-blue' : 'text-zinc-500 hover:text-brand-dark'}`}>
          <Home size={22} strokeWidth={isActive('/') ? 2.5 : 2} />
          <span suppressHydrationWarning className="text-[10px] font-medium">{t('home')}</span>
        </Link>

        {/* Trim / Cutter */}
        <Link suppressHydrationWarning href="/trim" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/trim') ? 'text-brand-blue' : 'text-zinc-500 hover:text-brand-dark'}`}>
          <Scissors size={22} strokeWidth={isActive('/trim') ? 2.5 : 2} />
          <span suppressHydrationWarning className="text-[10px] font-medium">{t('trim')}</span>
        </Link>

        {/* Requests */}
        <Link suppressHydrationWarning href="/requests" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/requests') ? 'text-brand-blue' : 'text-zinc-500 hover:text-brand-dark'}`}>
          <MessageSquare size={22} strokeWidth={isActive('/requests') ? 2.5 : 2} />
          <span suppressHydrationWarning className="text-[10px] font-medium">{t('requests')}</span>
        </Link>

        {/* Profile */}
        <Link suppressHydrationWarning href="/profile" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/profile') ? 'text-brand-blue' : 'text-zinc-500 hover:text-brand-dark'}`}>
          <User size={22} strokeWidth={isActive('/profile') ? 2.5 : 2} />
          <span suppressHydrationWarning className="text-[10px] font-medium">{t('profile')}</span>
        </Link>
      </div>
    </div>
  );
}
