'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, MessageSquare, Scissors } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => pathname === path;

  if (!mounted) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-brand-gray h-16 md:hidden">
        <div className="flex justify-between items-center h-16 max-w-md mx-auto px-4" />
      </div>
    );
  }

  return (
    <div className="bottom-nav-fixed fixed bottom-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-md border-t border-brand-gray pb-safe transition-colors duration-300 md:hidden">
      <div className="flex justify-between items-center h-16 max-w-md mx-auto px-4">
        {/* Home */}
        <Link href="/" className={`flex flex-col items-center gap-1 transition-colors flex-1 ${isActive('/') ? 'text-brand-blue' : 'text-zinc-600 hover:text-brand-dark'}`}>
          <Home size={20} strokeWidth={isActive('/') ? 2.5 : 2} />
          <span className="text-[10px] font-bold">{t('home')}</span>
        </Link>

        {/* Trim / Cutter */}
        <Link href="/trim" className={`flex flex-col items-center gap-1 transition-colors flex-1 ${isActive('/trim') ? 'text-brand-blue' : 'text-zinc-600 hover:text-brand-dark'}`}>
          <Scissors size={20} strokeWidth={isActive('/trim') ? 2.5 : 2} />
          <span className="text-[10px] font-bold">{t('trim')}</span>
        </Link>



        {/* Requests */}
        <Link href="/requests" className={`flex flex-col items-center gap-1 transition-colors flex-1 ${isActive('/requests') ? 'text-brand-blue' : 'text-zinc-600 hover:text-brand-dark'}`}>
          <MessageSquare size={20} strokeWidth={isActive('/requests') ? 2.5 : 2} />
          <span className="text-[10px] font-bold">{t('requests')}</span>
        </Link>

        {/* Profile */}
        <Link href="/profile" className={`flex flex-col items-center gap-1 transition-colors flex-1 ${isActive('/profile') ? 'text-brand-blue' : 'text-zinc-600 hover:text-brand-dark'}`}>
          <User size={20} strokeWidth={isActive('/profile') ? 2.5 : 2} />
          <span className="text-[10px] font-bold">{t('profile')}</span>
        </Link>
      </div>
    </div>
  );
}
