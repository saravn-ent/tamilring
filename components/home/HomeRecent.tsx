import React from 'react';
import SectionHeader from '@/components/SectionHeader';
import RingtoneCard from '@/components/RingtoneCard';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { unstable_cache } from 'next/cache';
import { Ringtone } from '@/types';

const getRecentRingtones = unstable_cache(
    async () => {
        const { data } = await supabase.from('ringtones').select('*').eq('status', 'approved').order('created_at', { ascending: false }).limit(6);
        return data || [];
    },
    ['recent-ringtones-v1'],
    { revalidate: 3600, tags: ['recent'] }
);

export default async function HomeRecent() {
    const recent = await getRecentRingtones();

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
