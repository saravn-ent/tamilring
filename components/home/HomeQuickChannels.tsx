'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, Crown, Music2, Zap, Radio, MessageSquareQuote } from 'lucide-react';

const CHANNELS = [
    {
        id: 'viral',
        label: 'Viral Reels',
        icon: Flame,
        href: '/recent',
        className: 'bg-m3-primary/10 text-m3-primary border-m3-primary/30 hover:bg-m3-primary hover:text-m3-on-primary',
        iconClass: 'text-m3-primary'
    },
    {
        id: 'ilayaraja',
        label: 'Ilayaraja 80s/90s',
        icon: Crown,
        href: '/artist/Ilaiyaraaja',
        className: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30 hover:bg-amber-600 hover:text-white',
        iconClass: 'text-amber-600 dark:text-amber-400'
    },
    {
        id: 'rahman',
        label: 'AR Rahman Magic',
        icon: Music2,
        href: '/artist/A.R.%20Rahman',
        className: 'bg-violet-500/10 text-violet-800 dark:text-violet-300 border-violet-500/30 hover:bg-violet-600 hover:text-white',
        iconClass: 'text-violet-600 dark:text-violet-400'
    },
    {
        id: 'devotional',
        label: 'Bhakthi & Spiritual',
        icon: Zap,
        href: '/mood/Devotional',
        className: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-600 hover:text-white',
        iconClass: 'text-emerald-600 dark:text-emerald-400'
    },
    {
        id: 'bgm',
        label: 'Pure BGM & Flute',
        icon: Radio,
        href: '/mood/BGM',
        className: 'bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 border-cyan-500/30 hover:bg-cyan-600 hover:text-white',
        iconClass: 'text-cyan-600 dark:text-cyan-400'
    },
    {
        id: 'dialogue',
        label: 'Mass Dialogues',
        icon: MessageSquareQuote,
        href: '/mood/Dialogue',
        className: 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/30 hover:bg-rose-600 hover:text-white',
        iconClass: 'text-rose-600 dark:text-rose-400'
    }
];

export default function HomeQuickChannels() {
    return (
        <div className="w-full overflow-hidden py-1 mb-2">
            <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-hide snap-x pt-0.5 px-0.5">
                {CHANNELS.map((ch) => {
                    const Icon = ch.icon;
                    return (
                        <Link
                            key={ch.id}
                            href={ch.href}
                            className={`snap-start shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border transition-all duration-200 text-xs font-bold shadow-2xs active:scale-95 group ${ch.className}`}
                        >
                            <Icon size={14} className="shrink-0 transition-transform group-hover:scale-110" />
                            <span className="whitespace-nowrap">{ch.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
