import React from 'react';
import SectionHeader from '@/components/SectionHeader';
import RingtoneCard from '@/components/RingtoneCard';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { unstable_cache } from 'next/cache';
import { Ringtone } from '@/types';
import { headers } from 'next/headers';

async function getRecentRingtones(lang: string = 'tamil') {
    return unstable_cache(
        async () => {
            let query = supabase
                .from('ringtones')
                .select('*')
                .eq('status', 'approved');

            // If it's the primary language, also show NULL language ringtones (legacy)
            if (lang === 'tamil') {
                query = query.or(`language.eq.${lang},language.is.null`);
            } else {
                query = query.eq('language', lang);
            }

            const { data } = await query
                .order('created_at', { ascending: false })
                .limit(6);

            // FALLBACK: If no results for this specific language, show latest from all languages
            if (!data || data.length === 0) {
                const { data: fallbackData } = await supabase
                    .from('ringtones')
                    .select('*')
                    .eq('status', 'approved')
                    .order('created_at', { ascending: false })
                    .limit(6);
                return fallbackData || [];
            }

            return data || [];
        },
        ['recent-ringtones-v6', lang],
        { revalidate: 3600, tags: ['recent'] }
    )();
}

async function getCurrentLang() {
    const head = await headers();
    const lang = head.get('x-user-language') || 'ta';
    return lang === 'ta' ? 'tamil' : 'english';
}

export default async function HomeRecent() {
    const lang = await getCurrentLang();
    const recent = await getRecentRingtones(lang);

    return (
        <div className="px-4 mb-10">
            <SectionHeader title="Just Added" translationKey="justAdded" />
            <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 mb-6">
                {recent?.map((ringtone: Ringtone) => (
                    <RingtoneCard key={ringtone.id} ringtone={ringtone} />
                ))}
            </div>

            <Link
                href="/recent"
                className="block w-full py-3 rounded-xl bg-wash text-zinc-600 text-center text-sm font-bold hover:bg-brand-gray transition-colors border border-brand-gray"
            >
                {recent.length > 0 ? "View All New Ringtones" : "No New Ringtones"}
            </Link>
        </div>
    );
}
