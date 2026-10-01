'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Heart,
    Music,
    Flame,
    CloudRain,
    MessageCircle,
    Zap,
    Star,
    Compass,
    Sparkles,
    Calendar,
    Radio
} from 'lucide-react';
import {
    FluteIcon,
    ViolinIcon,
    VeenaIcon,
    TrumpetIcon,
    WhistleIcon,
    SaxophoneIcon,
    NadaswaramIcon,
    DrumsIcon
} from '@/components/InstrumentIcons';
import { useLanguage } from '@/context/LanguageContext';
import { ERAS, INSTRUMENTS } from '@/lib/constants';

const MOODS_DATA = [
    { id: 'valentines', label: "Valentine's", href: '/valentines', icon: Heart, badge: 'HOT' },
    { id: 'bgm', label: 'BGM', href: '/mood/BGM', icon: Music },
    { id: 'mass', label: 'Mass', href: '/mood/Mass', icon: Flame },
    { id: 'love', label: 'Love', href: '/mood/Love', icon: Heart },
    { id: 'melody', label: 'Melody', href: '/mood/Melody', icon: Sparkles },
    { id: 'sad', label: 'Sad', href: '/mood/Sad', icon: CloudRain },
    { id: 'dialogue', label: 'Dialogue', href: '/mood/Dialogue', icon: MessageCircle },
    { id: 'devotional', label: 'Devotional', href: '/mood/Devotional', icon: Zap },
    { id: 'remix', label: 'Remix', href: '/mood/Remix', icon: Star },
];

const INSTRUMENT_ICONS: Record<string, React.ElementType> = {
    flute: FluteIcon,
    violin: ViolinIcon,
    whistle: WhistleIcon,
    saxophone: SaxophoneIcon,
    veena: VeenaIcon,
    trumpet: TrumpetIcon,
    nadaswaram: NadaswaramIcon,
    drums: DrumsIcon,
};

export default function HomeExploreChips() {
    const { t } = useLanguage();
    const [exploreMode, setExploreMode] = useState<'moods' | 'eras' | 'instruments'>('moods');

    return (
        <div className="w-full bg-m3-surface-container-low border border-m3-outline-variant/30 rounded-3xl p-3.5 sm:p-5 mb-6 m3-elevation-1">
            {/* Header + M3 Segmented Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-m3-primary/10 text-m3-primary flex items-center justify-center">
                        <Compass size={16} />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-m3-on-surface">
                        {t('browseCollections') || 'Explore Collections'}
                    </h3>
                </div>

                {/* M3 Segmented Button */}
                <div className="flex items-center gap-1 bg-m3-surface-container p-1 rounded-full border border-m3-outline-variant/40 self-start sm:self-auto text-xs">
                    <button
                        type="button"
                        onClick={() => setExploreMode('moods')}
                        className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                            exploreMode === 'moods'
                                ? 'bg-m3-secondary-container text-m3-on-secondary-container shadow-2xs'
                                : 'text-m3-on-surface-variant hover:text-m3-on-surface'
                        }`}
                    >
                        Moods & Genres
                    </button>
                    <button
                        type="button"
                        onClick={() => setExploreMode('eras')}
                        className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                            exploreMode === 'eras'
                                ? 'bg-m3-secondary-container text-m3-on-secondary-container shadow-2xs'
                                : 'text-m3-on-surface-variant hover:text-m3-on-surface'
                        }`}
                    >
                        Eras (70s-2020s)
                    </button>
                    <button
                        type="button"
                        onClick={() => setExploreMode('instruments')}
                        className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                            exploreMode === 'instruments'
                                ? 'bg-m3-secondary-container text-m3-on-secondary-container shadow-2xs'
                                : 'text-m3-on-surface-variant hover:text-m3-on-surface'
                        }`}
                    >
                        Instruments
                    </button>
                </div>
            </div>

            {/* Content Mode: Moods (M3 Filter/Assist Chips) */}
            {exploreMode === 'moods' && (
                <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-hide snap-x pt-0.5 sm:flex-wrap">
                    {MOODS_DATA.map((mood) => {
                        const Icon = mood.icon;
                        return (
                            <Link
                                key={mood.id}
                                href={mood.href}
                                className="snap-start shrink-0 inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-m3-surface hover:bg-m3-surface-container border border-m3-outline-variant/60 text-m3-on-surface-variant hover:text-m3-on-surface transition-all duration-200 active:scale-95 group text-xs font-semibold shadow-2xs"
                            >
                                <Icon size={14} className="text-m3-primary group-hover:scale-110 transition-transform" />
                                <span>{mood.label}</span>
                                {mood.badge && (
                                    <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-md bg-m3-error text-m3-on-error leading-tight">
                                        {mood.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Content Mode: Eras */}
            {exploreMode === 'eras' && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-0.5">
                    {ERAS.map((era) => (
                        <Link
                            key={era.label}
                            href={`/search?q=${encodeURIComponent(era.label)}&hideSearch=true`}
                            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-m3-surface hover:bg-m3-surface-container border border-m3-outline-variant/40 transition-all duration-200 group active:scale-95 text-center shadow-2xs"
                        >
                            <Calendar size={15} className="text-m3-primary mb-0.5 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold text-m3-on-surface group-hover:text-m3-primary">
                                {era.label}
                            </span>
                            <span className="text-[10px] text-m3-on-surface-variant font-medium">Decade</span>
                        </Link>
                    ))}
                </div>
            )}

            {/* Content Mode: Instruments */}
            {exploreMode === 'instruments' && (
                <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-hide snap-x pt-0.5 sm:grid sm:grid-cols-4 md:grid-cols-8 sm:overflow-visible">
                    {INSTRUMENTS.map((inst) => {
                        const Icon = INSTRUMENT_ICONS[inst.query] || Radio;
                        return (
                            <Link
                                key={inst.label}
                                href={`/search?q=${encodeURIComponent(inst.query)}&hideSearch=true`}
                                className="snap-start shrink-0 flex flex-col items-center gap-1 p-2 rounded-2xl bg-m3-surface hover:bg-m3-surface-container border border-m3-outline-variant/40 transition-all min-w-[70px] sm:min-w-0 active:scale-95 group shadow-2xs"
                            >
                                <div className="w-8 h-8 rounded-full bg-m3-primary/10 text-m3-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Icon size={15} />
                                </div>
                                <span className="text-[11px] font-medium text-m3-on-surface truncate w-full text-center">
                                    {inst.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

