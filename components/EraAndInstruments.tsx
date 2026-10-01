'use client';

import Link from 'next/link';
import { Guitar, Keyboard } from 'lucide-react';
import { VeenaIcon, TrumpetIcon, WhistleIcon, SaxophoneIcon, FluteIcon, ViolinIcon, NadaswaramIcon, DrumsIcon } from './InstrumentIcons';
import { ERAS, INSTRUMENTS } from '@/lib/constants';
import { useLanguage } from '@/context/LanguageContext';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_MAP: Record<string, any> = {
    flute: FluteIcon,
    violin: ViolinIcon,
    guitar: Guitar,
    piano: Keyboard,
    keyboard: Keyboard,
    whistle: WhistleIcon,
    saxophone: SaxophoneIcon,
    veena: VeenaIcon,
    trumpet: TrumpetIcon,
    nadaswaram: NadaswaramIcon,
    drums: DrumsIcon
};

const ERA_GRADIENTS: Record<string, string> = {
    '80s': 'from-amber-500/15 via-orange-500/5 to-transparent border-amber-500/20',
    '90s': 'from-yellow-500/15 via-amber-500/5 to-transparent border-yellow-500/20',
    '2000s': 'from-cyan-500/15 via-blue-500/5 to-transparent border-cyan-500/20',
    '2010s': 'from-purple-500/15 via-indigo-500/5 to-transparent border-purple-500/20',
    '2020s': 'from-rose-500/15 via-pink-500/5 to-transparent border-rose-500/20',
};

export default function EraAndInstruments() {
    const { t } = useLanguage();

    return (
        <div className="space-y-8 mb-8 px-3 sm:px-4 max-w-7xl mx-auto">
            {/* By Era Section */}
            <section aria-label="Browse By Era">
                <div className="mb-3 px-0.5">
                    <h2 className="text-xs sm:text-sm font-extrabold text-m3-outline uppercase tracking-wider">
                        {t('byEra')} • Golden Decades of Kollywood
                    </h2>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3.5">
                    {ERAS.map((era) => {
                        const gradient = ERA_GRADIENTS[era.label] || 'from-zinc-500/10 to-transparent border-m3-outline-variant/30';

                        return (
                            <Link
                                key={era.label}
                                href={`/search?q=${encodeURIComponent(era.label)}&hideSearch=true`}
                                onClick={() => hapticFeedback(hapticPatterns.selection)}
                                className="block group"
                            >
                                <div className={`h-18 sm:h-20 rounded-2xl flex flex-col items-center justify-center bg-gradient-to-br ${gradient} bg-m3-surface-container-low hover:bg-m3-surface-container border group-hover:border-m3-primary/50 text-center shadow-2xs group-hover:shadow-md group-hover:-translate-y-0.5 transition-all duration-300`}>
                                    <span className="text-lg sm:text-xl font-extrabold text-m3-on-surface group-hover:text-m3-primary tracking-tight transition-colors">
                                        {era.label}
                                    </span>
                                    <span className="text-[10px] font-semibold text-m3-outline uppercase tracking-wider group-hover:text-m3-on-surface-variant transition-colors">
                                        Classics
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* Instruments Section */}
            <section aria-label="Browse By Instruments">
                <div className="mb-3 px-0.5">
                    <h2 className="text-xs sm:text-sm font-extrabold text-m3-outline uppercase tracking-wider">
                        {t('instruments')} • Pure Acoustic & Instrumental Solos
                    </h2>
                </div>
                <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x pt-0.5 md:grid md:grid-cols-4 lg:grid-cols-8 md:overflow-visible">
                    {INSTRUMENTS.map((inst) => {
                        const Icon = ICON_MAP[inst.query];
                        return (
                            <Link
                                key={inst.label}
                                href={`/search?q=${encodeURIComponent(inst.query)}&hideSearch=true`}
                                onClick={() => hapticFeedback(hapticPatterns.selection)}
                                className="snap-start shrink-0 min-w-[80px] sm:min-w-[92px] md:min-w-0 md:w-full block group"
                            >
                                <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-m3-surface-container-low hover:bg-m3-surface-container border border-m3-outline-variant/30 hover:border-m3-primary/50 text-center shadow-2xs group-hover:shadow-md group-hover:-translate-y-0.5 transition-all duration-300">
                                    <div className="w-10 h-10 rounded-full bg-m3-primary/10 text-m3-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-m3-primary group-hover:text-m3-on-primary transition-all duration-300 shadow-xs">
                                        {Icon && <Icon size={20} strokeWidth={2} />}
                                    </div>
                                    <span className="text-[11px] font-bold text-m3-on-surface uppercase tracking-wider truncate w-full group-hover:text-m3-primary transition-colors">
                                        {inst.label}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
