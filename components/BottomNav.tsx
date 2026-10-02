'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, MessageSquare, Sparkles, Search } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  if (pathname?.startsWith('/admin')) return null;

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const navItems = [
    { href: '/', icon: Home, label: t('home') },
    { href: '/search', icon: Search, label: t('search') },
    { href: '/tools', icon: Sparkles, label: t('studio') },
    { href: '/requests', icon: MessageSquare, label: t('requests') },
    { href: '/profile', icon: User, label: t('profile') },
  ];


  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="bottom-nav-fixed fixed bottom-0 left-0 right-0 z-100 bg-m3-surface-container/95 backdrop-blur-xl border-t border-m3-outline-variant/30 transition-all duration-300 md:hidden m3-elevation-2"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-around items-center h-14 max-w-md mx-auto px-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              onClick={() => hapticFeedback(hapticPatterns.selection)}
              className="group relative flex flex-col items-center justify-center gap-0.5 transition-all duration-200 flex-1 h-full py-1 touch-manipulation"
            >
              {/* M3 Active Pill Indicator */}
              <div 
                className={`w-12 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                  active 
                    ? 'bg-m3-secondary-container text-m3-on-secondary-container shadow-2xs' 
                    : 'bg-transparent text-m3-on-surface-variant group-hover:bg-m3-on-surface/5 group-hover:text-m3-on-surface'
                }`}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2.5 : 2}
                  className={active ? 'scale-105 transition-transform duration-200' : ''}
                />
              </div>

              {/* M3 Label */}
              <span 
                className={`text-[10px] tracking-tight leading-none transition-colors duration-200 ${
                  active 
                    ? 'font-bold text-m3-on-surface' 
                    : 'font-medium text-m3-on-surface-variant group-hover:text-m3-on-surface'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

