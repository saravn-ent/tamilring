'use client';

import React from 'react';
import Link from 'next/link';
import SectionHeader from '@/components/SectionHeader';
import {
    FluteIcon,
    ViolinIcon,
    VeenaIcon,
    WhistleIcon,
    SaxophoneIcon,
    NadaswaramIcon
} from '@/components/InstrumentIcons';
import { Guitar, Keyboard } from 'lucide-react';

const INSTRUMENT_LIST = [
    { label: 'Flute BGM', query: 'flute', icon: FluteIcon, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Violin Hits', query: 'violin', icon: ViolinIcon, color: 'text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20' },
    { label: 'Acoustic Guitar', query: 'guitar', icon: Guitar, color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { label: 'Whistle Themes', query: 'whistle', icon: WhistleIcon, color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    { label: 'Saxophone', query: 'saxophone', icon: SaxophoneIcon, color: 'text-pink-600 dark:text-pink-400 bg-pink-500/10 border-pink-500/20' },
    { label: 'Veena Classical', query: 'veena', icon: VeenaIcon, color: 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20' },
    { label: 'Nadaswaram', query: 'nadaswaram', icon: NadaswaramIcon, color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
    { label: 'Piano Melodies', query: 'piano', icon: Keyboard, color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20' },
];

export default function HomeInstrumentals() {
    return (
        <div className="mb-8">
            <div className="px-3 sm:px-4">
                <SectionHeader
                    title="Pure BGM & Instruments"
                    subtitle="BGM & Themes"
                    href="/mood/BGM"
                />
            </div>
            <div className="flex gap-2.5 overflow-x-auto px-3 sm:px-4 pb-3 scrollbar-hide snap-x pt-1 md:grid md:grid-cols-4 lg:grid-cols-8 md:overflow-visible">
                {INSTRUMENT_LIST.map((inst) => {
                    const Icon = inst.icon;
                    return (
                        <Link
                            key={inst.query}
                            href={`/search?q=${encodeURIComponent(inst.query)}&hideSearch=true`}
                            className="snap-start shrink-0 flex flex-col items-center justify-center p-3 rounded-2xl bg-m3-surface-container-low hover:bg-m3-surface-container border border-m3-outline-variant/30 hover:border-m3-primary/40 transition-all duration-200 min-w-[95px] sm:min-w-0 md:w-full active:scale-95 group shadow-2xs text-center"
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1.5 border transition-transform group-hover:scale-110 ${inst.color}`}>
                                <Icon size={20} />
                            </div>
                            <span className="text-xs font-bold text-m3-on-surface truncate w-full group-hover:text-m3-primary transition-colors">
                                {inst.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
