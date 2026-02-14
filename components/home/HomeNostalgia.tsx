import React from 'react';
import SectionHeader from '@/components/SectionHeader';
import NostalgiaList from './NostalgiaList';
import { supabase } from '@/lib/supabaseClient';
import { unstable_cache } from 'next/cache';
import { getUserLanguage } from '@/app/actions/ringtones';

const getNostalgiaRingtones = unstable_cache(
    async (lang: string = 'tamil') => {
        const getQuery = (l: string) => {
            let q = supabase
                .from('ringtones')
                .select('*')
                .eq('status', 'approved')
                .lt('movie_year', 2015)
                .order('likes', { ascending: false })
                .limit(50);

            if (l === 'tamil') {
                q = q.or(`language.eq.${l},language.is.null`);
            } else {
                q = q.eq('language', l);
            }
            return q;
        };

        let { data: ringtones } = await getQuery(lang);

        // Fallback 1: If few results for requested lang, try tamil
        if ((!ringtones || ringtones.length < 12) && lang !== 'tamil') {
            const { data: fallback } = await getQuery('tamil');
            if (fallback && fallback.length > 0) {
                const existingIds = new Set(ringtones?.map(r => r.id) || []);
                const newStuff = fallback.filter(r => !existingIds.has(r.id));
                ringtones = [...(ringtones || []), ...newStuff];
            }
        }

        // Fallback 2: If still not enough (even for Tamil), relax the year constraint
        if (!ringtones || ringtones.length < 12) {
            const { data: relaxed } = await supabase
                .from('ringtones')
                .select('*')
                .eq('status', 'approved')
                .lte('movie_year', '2018') // Relax to 2018
                .order('likes', { ascending: false })
                .limit(50);

            if (relaxed && relaxed.length > 0) {
                const existingIds = new Set(ringtones?.map(r => r.id) || []);
                const newStuff = relaxed.filter(r => !existingIds.has(r.id));
                ringtones = [...(ringtones || []), ...newStuff];
            }
        }

        if (!ringtones || ringtones.length === 0) return [];

        // Shuffle and take 12
        const shuffled = ringtones.sort(() => 0.5 - Math.random()).slice(0, 12);

        // Enrich with profiles if needed
        const userIds = Array.from(new Set(shuffled.map(r => r.user_id).filter(Boolean)));
        if (userIds.length === 0) return shuffled;

        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]));
        return shuffled.map(r => ({ ...r, profile: profileMap.get(r.user_id) }));

    },
    ['nostalgia-ringtones-v20'], // High version bump
    { revalidate: 3600, tags: ['nostalgia'] }
);

interface Props {
    lang: string;
}

export default async function HomeNostalgia({ lang }: Props) {
    // Use lang as part of the cache key by wrapping or passing it
    const nostalgia = await getNostalgiaRingtones(lang);

    if (!nostalgia || nostalgia.length === 0) return null;

    return (
        <div className="mb-10">
            <div className="px-4 mb-6">
                <SectionHeader title="Rewind Memories" />
            </div>
            <NostalgiaList nostalgia={nostalgia} />
        </div>
    );
}
