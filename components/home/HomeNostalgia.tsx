import React from 'react';
import SectionHeader from '@/components/SectionHeader';
import NostalgiaList from './NostalgiaList';
import { supabase } from '@/lib/supabaseClient';
import { unstable_cache } from 'next/cache';
import { headers } from 'next/headers';

const getNostalgiaRingtones = unstable_cache(
    async (lang: string = 'tamil') => {
        const getQuery = (l: string) => {
            let q = supabase
                .from('ringtones')
                .select('*')
                .eq('status', 'approved')
                .lt('movie_year', 2015)
                .order('likes', { ascending: false })
                .limit(10);

            if (l === 'tamil') {
                q = q.or(`language.eq.${l},language.is.null`);
            } else {
                q = q.eq('language', l);
            }
            return q;
        };

        let { data: ringtones } = await getQuery(lang);

        // Fallback: If no results for requested lang, try tamil
        if ((!ringtones || ringtones.length === 0) && lang !== 'tamil') {
            console.log(`No nostalgia found for ${lang}, falling back to tamil`);
            const { data: fallback } = await getQuery('tamil');
            ringtones = fallback;
        }

        // Ultimate fallback: Any nostalgia
        if (!ringtones || ringtones.length === 0) {
            const { data: ultimateFallback } = await supabase
                .from('ringtones')
                .select('*')
                .eq('status', 'approved')
                .lt('movie_year', 2015)
                .order('likes', { ascending: false })
                .limit(10);
            ringtones = ultimateFallback;
        }

        if (!ringtones || ringtones.length === 0) return [];

        const userIds = Array.from(new Set(ringtones.map(r => r.user_id).filter(Boolean)));
        if (userIds.length === 0) return ringtones;

        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]));
        return ringtones.map(r => ({ ...r, profile: profileMap.get(r.user_id) }));

    },
    ['nostalgia-ringtones-v3'],
    { revalidate: 3600, tags: ['nostalgia'] }
);

async function getCurrentLang() {
    const head = await headers();
    const lang = head.get('x-user-language') || 'ta';
    return lang === 'ta' ? 'tamil' : 'english';
}

export default async function HomeNostalgia() {
    const lang = await getCurrentLang();
    const nostalgia = await getNostalgiaRingtones(lang);

    if (!nostalgia || nostalgia.length === 0) return null;

    return (
        <div className="mb-10">
            <div className="px-4">
                <SectionHeader title="Rewind: Memories" translationKey="memories" />
                <p className="text-xs text-zinc-500 mb-3 -mt-2">Rings that bring back the good times</p>
            </div>
            <NostalgiaList nostalgia={nostalgia} />
        </div>
    );
}
