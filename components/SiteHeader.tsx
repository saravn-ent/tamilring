'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link'; // Next.js Link component

export default function SiteHeader() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSurprise = async () => {
    try {
      setLoading(true);

      // Fetch a random approved ringtone slug
      // Using a simpler approach: get count, then select at random offset
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
      setTimeout(() => setLoading(false), 1000); // Visual feedback
    }
  };

  return (
    <div suppressHydrationWarning className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-brand-gray transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tighter text-brand-blue">
          <span>Tamil</span><span className="text-brand-dark">Ring</span>
        </Link>

        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
          <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-brand-blue transition-colors">
            Home
          </Link>
          <Link href="/trim" className="text-sm font-medium text-zinc-600 hover:text-brand-blue transition-colors">
            Trim
          </Link>
          <Link href="/requests" className="text-sm font-medium text-zinc-600 hover:text-brand-blue transition-colors">
            Requests
          </Link>
          <Link href="/profile" className="text-sm font-medium text-zinc-600 hover:text-brand-blue transition-colors">
            Profile
          </Link>
        </nav>

        <div className="flex items-center gap-1">
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
    </div>
  );
}
