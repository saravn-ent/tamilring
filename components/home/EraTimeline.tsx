'use client';

import React from 'react';
import Link from 'next/link';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';
import SectionHeader from '@/components/SectionHeader';
import StructuredData from '@/components/StructuredData';
import { generateCollectionItemListSchema } from '@/lib/seo';

interface EraItem {
    id: string;
    label: string;
    eraTitle: string;
    period: string;
    subtitle: string;
    gradient: string;
    accent: string;
}

// Backward timeline from modern hits to golden classics
const BACKWARD_ERAS: EraItem[] = [
    {
        id: '2020s',
        label: '2020s',
        eraTitle: 'Current Hits',
        period: '2020 - Present',
        subtitle: 'Anirudh & Viral BGM',
        gradient: 'from-rose-500/20 via-pink-500/10 to-transparent',
        accent: 'text-rose-400 border-rose-500/30'
    },
    {
        id: '2010s',
        label: '2010s',
        eraTitle: 'Mass Elevation',
        period: '2010 - 2019',
        subtitle: 'Kolaveri to Baahubali',
        gradient: 'from-purple-500/20 via-indigo-500/10 to-transparent',
        accent: 'text-purple-400 border-purple-500/30'
    },
    {
        id: '2000s',
        label: '2000s',
        eraTitle: 'Youth Melodies',
        period: '2000 - 2009',
        subtitle: 'Harris & Yuvan Wave',
        gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
        accent: 'text-cyan-400 border-cyan-500/30'
    },
    {
        id: '90s',
        label: '90s',
        eraTitle: 'ARR Revolution',
        period: '1990 - 1999',
        subtitle: 'Roja to Padayappa',
        gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
        accent: 'text-amber-400 border-amber-500/30'
    },
    {
        id: '80s',
        label: '80s',
        eraTitle: 'Raja Symphony',
        period: '1980 - 1989',
        subtitle: 'The Cassette Golden Age',
        gradient: 'from-orange-600/20 via-amber-600/10 to-transparent',
        accent: 'text-orange-400 border-orange-500/30'
    },
    {
        id: '70s',
        label: '70s',
        eraTitle: 'Retro Classics',
        period: '1970 - 1979',
        subtitle: 'MSV & Vintage Vinyl',
        gradient: 'from-emerald-600/20 via-teal-600/10 to-transparent',
        accent: 'text-emerald-400 border-emerald-500/30'
    }
];

export default function EraTimeline() {
    const eraTimelineSchema = generateCollectionItemListSchema({
        name: 'Decades of Kollywood — Tamil Cinema Era Timeline',
        description: 'Tamil cinema ringtones spanning 6 decades from the 1970s vintage era to 2020s modern anthems.',
        items: BACKWARD_ERAS.map(era => ({
            name: `${era.label} Tamil Hits — ${era.eraTitle}`,
            description: `${era.period}: ${era.subtitle}`,
            url: `/search?q=${encodeURIComponent(era.label)}&hideSearch=true`,
        })),
    });

    return (
        <section aria-label="Kollywood Decades Timeline" className="mb-8">
            <StructuredData data={eraTimelineSchema} />
            <div className="px-3 sm:px-4">
                <SectionHeader
                    title="Decades of Kollywood"
                    subtitle="Travel backward through Tamil cinema music history"
                    href="/categories"
                />
            </div>

            {/* Horizontal Timeline Row Going Backward */}
            <div className="flex gap-3 overflow-x-auto px-3 sm:px-4 pb-3 scrollbar-hide snap-x md:grid md:grid-cols-6 md:overflow-visible">
                {BACKWARD_ERAS.map((era) => (
                    <Link
                        key={era.id}
                        href={`/search?q=${encodeURIComponent(era.label)}&hideSearch=true`}
                        prefetch={false}
                        onClick={() => hapticFeedback(hapticPatterns.selection)}
                        className="snap-start shrink-0 min-w-[155px] sm:min-w-[170px] md:min-w-0 md:w-full group block"
                    >
                        <div className={`relative overflow-hidden rounded-2xl p-3.5 bg-gradient-to-br ${era.gradient} bg-m3-surface-container-low border border-m3-outline-variant/30 group-hover:border-m3-primary/50 group-hover:-translate-y-1 shadow-2xs group-hover:shadow-lg transition-all duration-300 h-full flex flex-col justify-between min-h-[96px]`}>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className={`text-base sm:text-lg font-black tracking-tight ${era.accent.split(' ')[0]}`}>
                                    {era.label}
                                </span>
                                <span className="text-[10px] font-semibold text-m3-on-surface-variant bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded">
                                    {era.period}
                                </span>
                            </div>

                            <div>
                                <h3 className="text-xs sm:text-sm font-bold text-m3-on-surface group-hover:text-m3-primary transition-colors leading-tight truncate">
                                    {era.eraTitle}
                                </h3>
                                <p className="text-[10px] text-m3-on-surface-variant truncate mt-0.5 font-medium">
                                    {era.subtitle}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
