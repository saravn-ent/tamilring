'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, Heart, Crown, Sparkles, Zap, Radio, Disc3, MessageSquareQuote } from 'lucide-react';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';

const CATEGORIES = [
    {
        id: 'mass',
        label: 'Mass BGM',
        icon: Flame,
        href: '/mood/Mass',
        iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    },
    {
        id: 'love',
        label: 'Kadhal / Love',
        icon: Heart,
        href: '/mood/Love',
        iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    },
    {
        id: 'maestros',
        label: 'Maestros',
        icon: Crown,
        href: '/artist/Ilaiyaraaja',
        iconBg: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    },
    {
        id: 'viral',
        label: 'Viral Reels',
        icon: Sparkles,
        href: '/recent',
        iconBg: 'bg-pink-500/15 text-pink-600 dark:text-pink-400',
        badge: 'HOT',
    },
    {
        id: 'bhakthi',
        label: 'Bhakthi',
        icon: Zap,
        href: '/mood/Devotional',
        iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    },
    {
        id: 'instruments',
        label: 'Flute & BGM',
        icon: Radio,
        href: '/search?q=flute&hideSearch=true',
        iconBg: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
    },
    {
        id: 'nostalgia',
        label: '80s/90s Gold',
        icon: Disc3,
        href: '/search?q=90s&hideSearch=true',
        iconBg: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
    },
    {
        id: 'dialogues',
        label: 'Dialogues',
        icon: MessageSquareQuote,
        href: '/mood/Dialogue',
        iconBg: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
    },
];

export default function ZeptoCategoryHub() {
    return (
        <section aria-label="Explore Categories" className="w-full mb-4 pt-1">
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                        <Link
                            key={cat.id}
                            href={cat.href}
                            onClick={() => hapticFeedback(hapticPatterns.selection)}
                            className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-m3-surface-container-low hover:bg-m3-surface-container border border-m3-outline-variant/30 transition-all duration-200 active:scale-[0.97] group shadow-2xs text-center cursor-pointer m3-elevation-0 hover:m3-elevation-1"
                        >
                            <div className="relative mb-1.5">
                                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${cat.iconBg}`}>
                                    <Icon size={19} />
                                </div>
                                {cat.badge && (
                                    <span className="absolute -top-1 -right-1.5 px-1.5 py-0.2 text-[8px] font-bold bg-m3-error text-m3-on-error rounded-full leading-none shadow-xs">
                                        {cat.badge}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs font-bold text-m3-on-surface group-hover:text-m3-primary transition-colors truncate w-full leading-tight">
                                {cat.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}

