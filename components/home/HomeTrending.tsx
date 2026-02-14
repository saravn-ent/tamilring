import React from 'react';
import SectionHeader from '@/components/SectionHeader';
import { getTrendingRingtones, getUserLanguage } from '@/app/actions/ringtones';
import TrendingList from './TrendingList';

import { supabase } from '@/lib/supabaseClient';

export default async function HomeTrending() {
    const lang = await getUserLanguage();
    let trending = await getTrendingRingtones(10, lang);
    console.log('HomeTrending: count =', trending?.length || 0);
    if (!trending || trending.length === 0) return null;

    // Fetch Profiles manually for attribution
    const userIds = Array.from(new Set(trending.map((r: any) => r.user_id).filter(Boolean)));
    if (userIds.length > 0) {
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds);

        const profileMap = new Map(profiles?.map((p: any) => [p.id, p]));
        trending = trending.map((r: any) => ({ ...r, profile: profileMap.get(r.user_id) }));
    }

    return (
        <div className="mb-10">
            <div className="px-4">
                <SectionHeader title="Trending Ringtones" translationKey="trending" />
            </div>
            <TrendingList trending={trending} />
        </div>
    );
}
