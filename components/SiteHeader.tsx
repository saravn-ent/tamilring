'use client';

import { useState, useEffect } from 'react';
import { useMounted } from '@/lib/hooks/use-mounted';
import { useRouter, usePathname } from 'next/navigation';
import { Sparkles, Loader2, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';

import DesktopHeaderSearch from '@/components/header/DesktopHeaderSearch';

export default function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const mounted = useMounted();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const isDark = resolvedTheme === 'dark' || theme === 'dark';

  useEffect(() => {
    if (pathname?.startsWith('/admin')) return;

    // Handle scroll for elevation & mobile hide/show
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 10);

      // Always show on top of page
      if (currentScrollY < 50) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // If scrolling down, hide. If scrolling up, show.
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, pathname]);

  if (pathname?.startsWith('/admin')) return null;

  const handleSurprise = async () => {
    try {
      setLoading(true);
      hapticFeedback(hapticPatterns.selection);

      const { supabase } = await import('@/lib/supabaseClient');
      const { count } = await supabase
        .from('ringtones')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      if (count && count > 0) {
        const randomIndex = Math.floor(Math.random() * count);
        const { data } = await supabase
          .from('ringtones')
          .select('slug')
          .eq('status', 'approved')
          .range(randomIndex, randomIndex)
          .single();

        if (data?.slug) {
          router.push(`/ringtone/${data.slug}`);
        }
      }
    } catch (error) {
      console.error('Surprise failed:', error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const toggleTheme = () => {
    hapticFeedback(hapticPatterns.selection);
    setTheme(isDark ? 'light' : 'dark');
  };


  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 border-b border-m3-outline-variant/30 h-auto transition-all duration-300 ${
        isScrolled 
          ? 'bg-m3-surface-container/95 backdrop-blur-md m3-elevation-2' 
          : 'bg-m3-surface/90 backdrop-blur-md'
      } ${isVisible ? 'translate-y-0' : '-translate-y-full md:translate-y-0'}`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-12 md:h-14 flex items-center justify-between gap-3 lg:gap-6">
        {/* Left: Brand Logo */}
        <Link 
          href="/" 
          className="text-lg md:text-xl font-display font-bold tracking-tight text-m3-primary flex items-center gap-0.5 shrink-0" 
          onClick={() => hapticFeedback(hapticPatterns.selection)}
        >
          <span>Tamil</span><span className="text-m3-on-surface">Ring</span>
        </Link>

        {/* Center: Desktop Menu Bar Search (Hidden on Mobile) */}
        <div className="hidden md:flex flex-1 justify-center max-w-sm lg:max-w-md mx-2">
          <DesktopHeaderSearch />
        </div>

        {/* Right: Desktop Navigation & Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-3 py-1.5 rounded-full text-xs font-semibold text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-on-surface/8 transition-all">
              Home
            </Link>
            <Link href="/tools" className="px-3 py-1.5 rounded-full text-xs font-semibold text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-on-surface/8 transition-all">
              Tools
            </Link>
            <Link href="/requests" className="px-3 py-1.5 rounded-full text-xs font-semibold text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-on-surface/8 transition-all">
              Requests
            </Link>
            <Link href="/upload" className="m3-btn-filled h-8 px-3.5 text-xs font-bold ml-0.5">
              Upload
            </Link>
            <Link href="/profile" className="px-3 py-1.5 rounded-full text-xs font-semibold text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-on-surface/8 transition-all">
              Profile
            </Link>
          </nav>

          <div className="flex items-center gap-1 pl-1 md:pl-2 md:border-l md:border-m3-outline-variant/30">
            {/* M3 Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="inline-flex items-center justify-center w-8.5 h-8.5 rounded-full text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-on-surface/8 active:scale-90 transition-all cursor-pointer"
              aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {mounted ? (
                isDark ? (
                  <Sun size={18} className="text-m3-tertiary transition-transform hover:rotate-45 duration-300" />
                ) : (
                  <Moon size={18} className="text-m3-secondary transition-transform hover:-rotate-12 duration-300" />
                )
              ) : (
                <div className="w-4.5 h-4.5" />
              )}
            </button>

            {/* M3 Surprise Me Button */}
            <button
              onClick={handleSurprise}
              disabled={loading}
              className="inline-flex items-center justify-center w-8.5 h-8.5 rounded-full text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-on-surface/8 active:scale-90 transition-all cursor-pointer relative group"
              aria-label="Surprise Me"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin text-m3-primary" />
              ) : (
                <>
                  <Sparkles size={18} className="group-hover:scale-110 transition-transform text-m3-primary" />
                  <span className="absolute -bottom-9 right-0 bg-m3-inverse-surface text-m3-inverse-on-surface text-[11px] font-medium px-2.5 py-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    Surprise Me!
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

