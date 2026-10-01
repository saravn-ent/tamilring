'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mic2, Music, Film, Clapperboard, ChevronRight } from 'lucide-react';
import HeroCard from '@/components/HeroCard';
import { useLanguage } from '@/context/LanguageContext';

interface ArtistItem {
    name: string;
    image: string;
}

interface ArtistsHubClientProps {
    singers: ArtistItem[];
    musicDirectors: ArtistItem[];
    actors: ArtistItem[];
    movieDirectors: ArtistItem[];
}

type TabKey = 'singers' | 'composers' | 'actors' | 'directors';

export default function ArtistsHubClient({
    singers,
    musicDirectors,
    actors,
    movieDirectors,
}: ArtistsHubClientProps) {
    const [activeTab, setActiveTab] = useState<TabKey>('singers');
    const { t } = useLanguage();

    const tabs: { key: TabKey; label: string; icon: React.ElementType; data: ArtistItem[]; countLabel: string }[] = [
        { key: 'singers', label: t('voices') || 'Singers', icon: Mic2, data: singers, countLabel: 'Playback Singers' },
        { key: 'composers', label: t('musicDirectors') || 'Composers', icon: Music, data: musicDirectors, countLabel: 'Music Directors' },
        { key: 'actors', label: t('actors') || 'Actors', icon: Film, data: actors, countLabel: 'Top Stars' },
        { key: 'directors', label: t('movieDirectors') || 'Directors', icon: Clapperboard, data: movieDirectors, countLabel: 'Visionary Directors' },
    ];

    const currentTabData = tabs.find((t) => t.key === activeTab) || tabs[0];

    return (
        <div className="w-full bg-m3-surface-container-low border border-m3-outline-variant/30 rounded-3xl p-3.5 sm:p-5 mb-8 m3-elevation-1">
            {/* Header + Segment Control */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-m3-primary animate-pulse" />
                        <h3 className="text-base sm:text-lg font-bold text-m3-on-surface">
                            Cinema & Creators
                        </h3>
                    </div>
                </div>

                {/* M3 Segmented Switcher */}
                <div className="flex bg-m3-surface-container p-1 rounded-full border border-m3-outline-variant/40 self-start sm:self-auto overflow-x-auto max-w-full scrollbar-hide">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                                    isActive
                                        ? 'bg-m3-secondary-container text-m3-on-secondary-container shadow-2xs'
                                        : 'text-m3-on-surface-variant hover:text-m3-on-surface'
                                }`}
                            >
                                <Icon size={13} className={isActive ? 'text-m3-on-secondary-container' : 'text-m3-on-surface-variant'} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Creators Carousel */}
            <div className="flex overflow-x-auto pb-2 scrollbar-hide snap-x pt-1 gap-2.5 sm:gap-3.5 md:grid md:grid-cols-4 lg:grid-cols-8 md:overflow-visible">
                {currentTabData.data && currentTabData.data.length > 0 ? (
                    currentTabData.data.map((artist, idx) => (
                        <HeroCard
                            key={`${activeTab}-${artist.name}-${idx}`}
                            index={idx}
                            name={artist.name}
                            image={artist.image}
                            href={`/artist/${encodeURIComponent(artist.name)}`}
                            priority={idx < 4}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-6 text-center text-xs text-m3-outline">
                        No creators found for this section.
                    </div>
                )}
            </div>

            {/* Bottom Link */}
            <div className="mt-3 pt-2.5 border-t border-m3-outline-variant/30 flex items-center justify-between">
                <span className="text-[11px] text-m3-outline font-medium">
                    Top 8 {currentTabData.countLabel.toLowerCase()}
                </span>
                <Link
                    href={`/directory?category=${activeTab}`}
                    className="inline-flex items-center gap-0.5 text-xs font-bold text-m3-primary hover:underline group"
                >
                    <span>Browse all {currentTabData.label}</span>
                    <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>
        </div>
    );
}

