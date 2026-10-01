'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Flame, Music, Disc3, Zap, MessageSquareQuote, ChevronRight } from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';

const VIBES = [
    {
        id: 'love',
        title: 'Kadhal & Love',
        subtitle: 'Romantic Melodies & Duets',
        icon: Heart,
        href: '/mood/Love',
        bgGradient: 'from-rose-500/15 via-rose-500/5 to-pink-500/15 dark:from-rose-950/40 dark:via-rose-900/10 dark:to-pink-950/40',
        border: 'border-rose-500/30 hover:border-rose-500/60',
        textColor: 'text-rose-600 dark:text-rose-400',
        iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
        badge: 'Top Vibe'
    },
    {
        id: 'mass',
        title: 'Mass & Swagger',
        subtitle: 'High Bass BGM & Walk Themes',
        icon: Flame,
        href: '/mood/Mass',
        bgGradient: 'from-amber-500/15 via-orange-500/5 to-red-500/15 dark:from-amber-950/40 dark:via-orange-900/10 dark:to-red-950/40',
        border: 'border-amber-500/30 hover:border-amber-500/60',
        textColor: 'text-amber-600 dark:text-amber-400',
        iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
        badge: 'High Bass'
    },
    {
        id: 'chill',
        title: 'Midnight Peace',
        subtitle: 'Flute & Violin Instrumentals',
        icon: Music,
        href: '/mood/BGM',
        bgGradient: 'from-violet-500/15 via-purple-500/5 to-indigo-500/15 dark:from-violet-950/40 dark:via-purple-900/10 dark:to-indigo-950/40',
        border: 'border-violet-500/30 hover:border-violet-500/60',
        textColor: 'text-violet-600 dark:text-violet-400',
        iconBg: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    },
    {
        id: 'gold',
        title: '80s/90s Goldmine',
        subtitle: 'Evergreen SPB & Janaki Hits',
        icon: Disc3,
        href: '/search?q=90s&hideSearch=true',
        bgGradient: 'from-teal-500/15 via-emerald-500/5 to-cyan-500/15 dark:from-teal-950/40 dark:via-emerald-900/10 dark:to-cyan-950/40',
        border: 'border-teal-500/30 hover:border-teal-500/60',
        textColor: 'text-teal-600 dark:text-teal-400',
        iconBg: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
    },
    {
        id: 'devotional',
        title: 'Daily Spiritual',
        subtitle: 'Murugan, Shiva & Morning Mantras',
        icon: Zap,
        href: '/mood/Devotional',
        bgGradient: 'from-amber-600/15 via-yellow-500/5 to-orange-500/15 dark:from-amber-950/40 dark:via-yellow-900/10 dark:to-orange-950/40',
        border: 'border-amber-500/30 hover:border-amber-500/60',
        textColor: 'text-amber-700 dark:text-amber-400',
        iconBg: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
    },
    {
        id: 'dialogue',
        title: 'Punch Dialogues',
        subtitle: 'Rajini, Vijay & Kamal Lines',
        icon: MessageSquareQuote,
        href: '/mood/Dialogue',
        bgGradient: 'from-red-500/15 via-rose-500/5 to-pink-500/15 dark:from-red-950/40 dark:via-rose-900/10 dark:to-pink-950/40',
        border: 'border-red-500/30 hover:border-red-500/60',
        textColor: 'text-red-600 dark:text-red-400',
        iconBg: 'bg-red-500/15 text-red-600 dark:text-red-400',
    },
];

export default function HomeVibeBento() {
    return (
        <div className="mb-8">
            <div className="px-3 sm:px-4">
                <SectionHeader
                    title="Pick Your Vibe"
                    subtitle="Curated Moods"
                    href="/categories"
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 px-3 sm:px-4">
                {VIBES.map((vibe) => {
                    const Icon = vibe.icon;
                    return (
                        <Link
                            key={vibe.id}
                            href={vibe.href}
                            className={`flex flex-col justify-between p-3.5 rounded-2xl bg-linear-to-br ${vibe.bgGradient} border ${vibe.border} transition-all duration-200 active:scale-95 group shadow-2xs hover:shadow-xs min-h-[110px]`}
                        >
                            <div className="flex items-start justify-between">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${vibe.iconBg}`}>
                                    <Icon size={16} />
                                </div>
                                {vibe.badge && (
                                    <span className="px-1.5 py-0.5 text-[8px] font-black uppercase rounded-full bg-rose-600 text-white shadow-2xs leading-none">
                                        {vibe.badge}
                                    </span>
                                )}
                            </div>

                            <div className="mt-3">
                                <h4 className={`text-xs font-black ${vibe.textColor} group-hover:underline flex items-center gap-0.5`}>
                                    <span>{vibe.title}</span>
                                    <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform shrink-0" />
                                </h4>
                                <p className="text-[10px] text-zinc-600 dark:text-zinc-400 font-medium truncate mt-0.5">
                                    {vibe.subtitle}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
