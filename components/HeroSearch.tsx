'use client';

import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/context/LanguageContext';

const DiscoverySearch = dynamic(() => import('./DiscoverySearch'), {
    loading: () => <div className="h-14 w-full bg-zinc-100 rounded-2xl" />,
    ssr: true
});

interface Props {
    trendingTags?: string[];
}

export default function HeroSearch({ trendingTags = [] }: Props) {
    const router = useRouter();
    const { t } = useLanguage();

    const handleTagClick = (tag: string) => {
        router.push(`/search?q=${encodeURIComponent(tag)}`);
    };

    return (
        <div className="w-full px-4 pt-6 pb-8 md:pt-10 md:pb-12 bg-white rounded-b-[2.5rem] shadow-sm mb-6 border-b border-white/50">
            <div className="max-w-2xl mx-auto text-center space-y-4">

                {/* Visual Headline */}
                <h2 className="text-3xl md:text-4xl font-bold text-brand-dark tracking-tight">
                    {t('findYourRingtone').split('Ringtone')[0]}
                    <span className="text-brand-accent">Ringtone</span>
                    {t('findYourRingtone').split('Ringtone')[1]}
                </h2>

                {/* Subtitle */}
                <p className="text-zinc-600 text-[13px] md:text-sm font-medium max-w-md mx-auto">
                    {t('searchSubtitle')}
                </p>

                {/* Search Bar - Now using DiscoverySearch for Universal results */}
                <div className="max-w-lg mx-auto w-full">
                    <DiscoverySearch />
                </div>

                {/* Quick Tags - Dynamic */}
                {trendingTags.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 text-xs text-zinc-600 font-medium animate-in fade-in slide-in-from-bottom-1 duration-300">
                        <span>{t('trendingLabel')}</span>
                        {trendingTags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => handleTagClick(tag)}
                                className="hover:text-brand-accent transition-colors capitalize"
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
