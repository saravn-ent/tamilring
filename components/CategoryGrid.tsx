'use client';

import React from 'react';
import Link from 'next/link';
import { Music, Heart, MessageCircle, CloudRain, Flame, Zap, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { TranslationKeys } from '@/lib/i18n';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';
import SectionHeader from '@/components/SectionHeader';
import StructuredData from '@/components/StructuredData';
import { generateCollectionItemListSchema } from '@/lib/seo';

interface CategoryStation {
    id: string;
    label: string;
    translationKey: TranslationKeys;
    subtitle: string;
    icon: React.ElementType;
    href: string;
    gradient: string;
    accentColor: string;
}

const STATIONS: CategoryStation[] = [
    {
        id: 'mass',
        label: 'Mass & Elevation',
        translationKey: 'mass',
        subtitle: 'Gym, swagger & teaser themes',
        icon: Flame,
        href: '/mood/Mass',
        gradient: 'from-orange-500/20 via-amber-500/10 to-transparent',
        accentColor: 'text-amber-500 bg-amber-500/15 border-amber-500/30'
    },
    {
        id: 'bgm',
        label: 'Iconic BGM',
        translationKey: 'bgm',
        subtitle: 'Cinema scores & goosebumps',
        icon: Music,
        href: '/mood/BGM',
        gradient: 'from-purple-500/20 via-indigo-500/10 to-transparent',
        accentColor: 'text-purple-400 bg-purple-500/15 border-purple-500/30'
    },
    {
        id: 'love',
        label: 'Romantic Melodies',
        translationKey: 'love',
        subtitle: 'Acoustic guitar & heartbeats',
        icon: Heart,
        href: '/mood/Love',
        gradient: 'from-rose-500/20 via-pink-500/10 to-transparent',
        accentColor: 'text-rose-400 bg-rose-500/15 border-rose-500/30'
    },
    {
        id: 'melody',
        label: 'Pure Melody',
        translationKey: 'melody',
        subtitle: '90s & 2000s evergreen nostalgia',
        icon: Sparkles,
        href: '/mood/Melody',
        gradient: 'from-teal-500/20 via-emerald-500/10 to-transparent',
        accentColor: 'text-teal-400 bg-teal-500/15 border-teal-500/30'
    },
    {
        id: 'sad',
        label: 'Rain & Melancholy',
        translationKey: 'sad',
        subtitle: 'Solo violins & midnight thoughts',
        icon: CloudRain,
        href: '/mood/Sad',
        gradient: 'from-blue-600/20 via-sky-500/10 to-transparent',
        accentColor: 'text-sky-400 bg-sky-500/15 border-sky-500/30'
    },
    {
        id: 'devotional',
        label: 'Bhakthi & Divine',
        translationKey: 'devotional',
        subtitle: 'Temple veena & morning shlokas',
        icon: Zap,
        href: '/mood/Devotional',
        gradient: 'from-amber-600/20 via-yellow-500/10 to-transparent',
        accentColor: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30'
    },
    {
        id: 'dialogue',
        label: 'Punch Dialogues',
        translationKey: 'dialogue',
        subtitle: 'Superstar cinema punchlines',
        icon: MessageCircle,
        href: '/mood/Dialogue',
        gradient: 'from-red-500/20 via-rose-500/10 to-transparent',
        accentColor: 'text-red-400 bg-red-500/15 border-red-500/30'
    }
];

export default function CategoryGrid() {
    const { t } = useLanguage();

    const moodStationsSchema = generateCollectionItemListSchema({
        name: 'Curated Mood Stations — Tamil Ringtones',
        description: 'Tamil ringtone stations curated by mood and energy: Mass, BGM, Love, Melody, Sad, Devotional, and Dialogue.',
        items: STATIONS.map(s => ({
            name: `${s.label} Tamil Ringtones`,
            description: s.subtitle,
            url: s.href,
        })),
    });

    return (
        <section aria-label="Curated Sound Stations" className="mb-8">
            <StructuredData data={moodStationsSchema} />
            <div className="px-3 sm:px-4">
                <SectionHeader
                    title="Curated Mood Stations"
                    subtitle="Tailored for every moment"
                    href="/categories"
                />
            </div>

            {/* Apple Music Style Tactile Capsules Rail */}
            <div className="flex gap-2.5 sm:gap-3 overflow-x-auto px-3 sm:px-4 pb-2 scrollbar-hide snap-x md:grid md:grid-cols-4 lg:grid-cols-7 md:overflow-visible">
                {STATIONS.map((station) => {
                    const Icon = station.icon;
                    return (
                        <Link
                            key={station.id}
                            href={station.href}
                            prefetch={false}
                            onClick={() => hapticFeedback(hapticPatterns.selection)}
                            className="snap-start shrink-0 min-w-[150px] sm:min-w-[170px] md:min-w-0 md:w-full group block"
                        >
                            <div className={`relative overflow-hidden rounded-2xl p-3 sm:p-3.5 bg-gradient-to-br ${station.gradient} bg-m3-surface-container-low border border-m3-outline-variant/30 group-hover:border-m3-primary/50 group-hover:-translate-y-0.5 shadow-2xs group-hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between min-h-[92px]`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-xs ${station.accentColor} group-hover:scale-110 transition-transform`}>
                                        <Icon size={16} strokeWidth={2.2} />
                                    </div>
                                    <span className="text-[10px] font-bold text-m3-on-surface-variant group-hover:text-m3-primary transition-colors">
                                        Station →
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-xs sm:text-sm font-bold text-m3-on-surface group-hover:text-m3-primary transition-colors leading-tight truncate">
                                        {t(station.translationKey) || station.label}
                                    </h3>
                                    <p className="text-[10px] text-m3-on-surface-variant truncate mt-0.5 font-medium">
                                        {station.subtitle}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
