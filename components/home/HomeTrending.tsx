import React from 'react';
import SectionHeader from '@/components/SectionHeader';
import { getTrendingRingtones } from '@/app/actions/ringtones';
import TrendingList from './TrendingList';

interface Props {
    lang: string;
}

export default async function HomeTrending({ lang }: Props) {
    // getTrendingRingtones should ideally return the profile data too
    const trending = await getTrendingRingtones(10, lang);

    if (!trending || trending.length === 0) return null;

    return (
        <div className="mb-10">
            <div className="px-4">
                <SectionHeader title="Trending Ringtones" translationKey="trending" />
            </div>
            <TrendingList trending={trending} />
        </div>
    );
}
