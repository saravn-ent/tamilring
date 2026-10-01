'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, Film, Crown, Zap, Radio, Sparkles, Disc3, MessageSquareQuote } from 'lucide-react';
import { usePathname } from 'next/navigation';

const CATEGORIES = [
    { id: 'all', label: 'All Hits', icon: Sparkles, href: '/' },
    { id: 'viral', label: 'Viral Reels', icon: Flame, href: '/recent', badge: 'HOT' },
    { id: 'movies', label: 'New Movies', icon: Film, href: '/recent' },
    { id: 'maestros', label: 'Maestros', icon: Crown, href: '/artist/Ilaiyaraaja' },
    { id: 'bhakthi', label: 'Bhakthi', icon: Zap, href: '/mood/Devotional' },
    { id: 'bgm', label: 'Pure BGM', icon: Radio, href: '/mood/BGM' },
    { id: 'instruments', label: 'Instruments', icon: Disc3, href: '/search?q=flute&hideSearch=true' },
    { id: 'dialogues', label: 'Dialogues', icon: MessageSquareQuote, href: '/mood/Dialogue' }
];

export default function ZeptoQuickNav() {
    const pathname = usePathname();

    return (
        <div className="w-full overflow-hidden mb-3 border-b border-m3-outline-variant/30 pb-2">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x pt-0.5 px-1">
                {CATEGORIES.map((cat, idx) => {
                    const Icon = cat.icon;
                    const isActive = idx === 0 && pathname === '/';

                    return (
                        <Link
                            key={cat.id}
                            href={cat.href}
                            className={`snap-start shrink-0 flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all duration-200 active:scale-95 group text-center min-w-[64px] sm:min-w-[72px] ${
                                isActive
                                    ? 'bg-m3-primary/10 text-m3-primary font-bold shadow-2xs'
                                    : 'text-m3-on-surface-variant hover:bg-m3-surface-container font-semibold'
                            }`}
                        >
                            <div className="relative">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                                    isActive 
                                        ? 'bg-m3-primary text-m3-on-primary shadow-xs' 
                                        : 'bg-m3-surface-container text-m3-on-surface-variant group-hover:bg-m3-surface-container-high group-hover:text-m3-on-surface'
                                }`}>
                                    <Icon size={16} />
                                </div>
                                {cat.badge && (
                                    <span className="absolute -top-1 -right-2 px-1 py-0.2 text-[8px] font-black bg-m3-error text-m3-on-error rounded-full leading-tight shadow-xs">
                                        {cat.badge}
                                    </span>
                                )}
                            </div>
                            <span className="text-[11px] whitespace-nowrap leading-tight">
                                {cat.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

