'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, MessageSquare, Scissors, Search } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { hapticFeedback } from '@/lib/haptics';

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  if (pathname?.startsWith('/admin')) return null;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const navItems = [
    { href: '/', icon: Home, label: t('home') },
    { href: '/search', icon: Search, label: t('search') },
    { href: '/trim', icon: Scissors, label: t('trim') },
    { href: '/requests', icon: MessageSquare, label: t('requests') },
    { href: '/profile', icon: User, label: t('profile') },
  ];

  if (!mounted) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-brand-gray h-16 md:hidden">
        <div className="flex justify-between items-center h-16 max-w-md mx-auto px-4" />
      </div>
    );
  }

  return (
    <div className="bottom-nav-fixed fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-xl border-t border-brand-gray pb-safe transition-all duration-300 md:hidden shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => hapticFeedback(15)}
              className={`relative flex flex-col items-center justify-center gap-1 transition-all duration-300 flex-1 h-full ${active ? 'text-brand-blue' : 'text-zinc-500 hover:text-brand-dark'
                }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${active ? 'bg-brand-blue/10 scale-110' : 'bg-transparent'
                }`}>
                <Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 2}
                  className={active ? 'animate-in zoom-in-75 duration-300' : ''}
                />
              </div>
              <span className={`text-[10px] font-bold transition-all duration-300 ${active ? 'opacity-100 transform translate-y-0' : 'opacity-70'
                }`}>
                {item.label}
              </span>

              {/* Active Indicator Bar */}
              {active && (
                <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-10 h-[3px] bg-brand-blue rounded-full shadow-[0_0_10px_rgba(var(--color-brand-blue),0.5)]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
