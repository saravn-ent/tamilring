import React from 'react';
import SectionHeader from '@/components/SectionHeader';
import { getTrendingRingtones } from '@/app/actions/ringtones';
import TrendingList from './TrendingList';

interface Props {
    lang: string;
}

export default async function HomeTrending({ lang }: Props) {
    // Fetch top 12 trending ringtones to populate 4 columns of 3 tracks each
    const trending = await getTrendingRingtones(12, lang);

    if (!trending || trending.length === 0) return null;

    return (
        <div className="mb-8">
            <div className="px-3 sm:px-4">
                <SectionHeader
                    title="Trending Ringtones"
                    subtitle="Top Chart • Viral BGM & Cuts"
                    translationKey="trending"
                    href="/recent"
                />
            </div>
            <TrendingList trending={trending} />
        </div>
    );
}
