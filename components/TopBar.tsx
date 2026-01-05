'use client';

import Link from 'next/link';
import { Scissors, Languages, Sun, Moon } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function TopBar() {
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="fixed top-0 left-0 right-0 bg-neutral-900/80 dark:bg-neutral-900/80 backdrop-blur-md z-40 border-b border-zinc-200 dark:border-neutral-800 transition-colors duration-300">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tighter text-emerald-500">
          Tamil<span className="text-zinc-900 dark:text-white">Ring</span>
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 text-zinc-400 hover:text-emerald-500 transition-colors"
            title="Toggle Theme"
          >
            {mounted && theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
            className="p-2 text-zinc-400 hover:text-emerald-500 transition-colors flex items-center gap-1"
            title="Switch Language"
          >
            <Languages size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{language === 'en' ? 'EN' : 'TA'}</span>
          </button>
          <Link href="/trim" className="p-2 text-zinc-400 hover:text-emerald-500 transition-colors" aria-label="Ringtone Cutter">
            <Scissors size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}
