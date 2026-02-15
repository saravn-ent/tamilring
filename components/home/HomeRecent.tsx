import React from 'react';
import SectionHeader from '@/components/SectionHeader';
import RingtoneCard from '@/components/RingtoneCard';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { unstable_cache } from 'next/cache';
import { Ringtone } from '@/types';
import { translations, Language } from '@/lib/i18n';

const getRecentRingtones = unstable_cache(
    async (lang: string = 'tamil') => {
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

        const { data: ringtones } = await query
            .order('created_at', { ascending: false })
            .limit(6);

        if (!ringtones || ringtones.length === 0) {
            // Fallback attempt (all languages)
            const { data: fallback } = await supabase
                .from('ringtones')
                .select('*')
                .eq('status', 'approved')
                .order('created_at', { ascending: false })
                .limit(6);

            // Fetch profiles for fallback
            if (fallback && fallback.length > 0) {
                const userIds = Array.from(new Set(fallback.map(r => r.user_id).filter(Boolean)));
                if (userIds.length > 0) {
                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('id, full_name')
                        .in('id', userIds);

                    const profileMap = new Map(profiles?.map(p => [p.id, p]));
                    return fallback.map(r => ({ ...r, profile: profileMap.get(r.user_id) }));
                }
                return fallback;
            }
            return [];
        }

        // Fetch profiles for main result
        const userIds = Array.from(new Set(ringtones.map((r: any) => r.user_id).filter(Boolean)));
        if (userIds.length > 0) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name')
                .in('id', userIds);

            const profileMap = new Map(profiles?.map((p: any) => [p.id, p]));
            return ringtones.map((r: any) => ({ ...r, profile: profileMap.get(r.user_id) }));
        }

        return ringtones;
    },
    ['recent-ringtones-v11'], // Updated version
    { revalidate: 3600, tags: ['recent'] }
);

export default async function HomeRecent({ lang }: { lang: string }) {
    const recent = await getRecentRingtones(lang);
    const t = translations[lang as Language] || translations.en;

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
                {recent.length > 0 ? t.viewAllNew : t.noNew}
            </Link>
        </div>
    );
}
