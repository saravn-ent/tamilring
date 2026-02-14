'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sparkles, Loader2, Bug } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { hapticFeedback } from '@/lib/haptics';

export default function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  if (pathname?.startsWith('/admin')) return null;

  useEffect(() => {
    setMounted(true);

    // Hide header on scroll down (mobile only)
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

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
  }, [lastScrollY]);

  const handleSurprise = async () => {
    // ... same as before
    try {
      setLoading(true);

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

  // NUCLEAR FIX: On server, render a stable skeleton that matches the TAG structure of the client
  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-brand-gray h-14">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <a href="/" className="text-xl font-bold tracking-tighter text-brand-blue">
            <span>Tamil</span><span className="text-brand-dark">Ring</span>
          </a>
          <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
            <div className="w-10 h-4" />
          </nav>
          <div className="w-10 h-10" />
        </div>
      </header>
    );
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-brand-gray h-14 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full md:translate-y-0'}`}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-display font-bold tracking-tighter text-brand-blue" onClick={() => hapticFeedback(10)}>
          <span>Tamil</span><span className="text-brand-dark">Ring</span>
        </Link>

        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
          <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-brand-blue transition-colors">
            Home
          </Link>
          <Link href="/tools" className="text-sm font-medium text-zinc-600 hover:text-brand-blue transition-colors">
            Tools
          </Link>
          <Link href="/requests" className="text-sm font-medium text-zinc-600 hover:text-brand-blue transition-colors">
            Requests
          </Link>
          <Link href="/upload" className="px-4 py-1.5 bg-brand-blue text-white text-sm font-bold rounded-full hover:bg-brand-dark transition-all">
            Upload
          </Link>
          <Link href="/profile" className="text-sm font-medium text-zinc-600 hover:text-brand-blue transition-colors">
            Profile
          </Link>
        </nav>

        <div className="flex items-center gap-1 min-w-[40px] justify-end">
          <Link
            href="https://t.me/tamilring_admin"
            target="_blank"
            className="p-2 text-zinc-400 hover:text-rose-500 transition-colors relative group"
            aria-label="Report Bug"
          >
            <Bug size={18} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute -bottom-8 right-0 bg-brand-dark text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Report Bug
            </span>
          </Link>

          <button
            onClick={handleSurprise}
            disabled={loading}
            className="p-2 text-zinc-400 hover:text-brand-accent transition-colors relative group"
            aria-label="Surprise Me"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin text-brand-accent" />
            ) : (
              <>
                <Sparkles size={20} className="group-hover:scale-110 transition-transform" />
                <span className="absolute -bottom-8 right-0 bg-brand-dark text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Surprise Me!
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
