import React from 'react';
import RingtoneCard from '@/components/RingtoneCard';
import { supabase } from '@/lib/supabaseClient';
import { unstable_cache } from 'next/cache';

const getDeityRingtones = unstable_cache(
    async (deityName: string, sort: string = 'recent') => {
        let query = supabase
            .from('ringtones')
            .select('*')
            .eq('status', 'approved')
            .ilike('movie_name', `%${deityName}%`)
            .contains('tags', ['Devotional']);

        // Apply sort
        switch (sort) {
            case 'downloads':
                query = query.order('downloads', { ascending: false });
                break;
            case 'likes':
                query = query.order('likes', { ascending: false });
                break;
            case 'year_desc':
            case 'year_asc':
                // Ringtones might not have year for devotional always, but if they do:
                query = query.order('created_at', { ascending: false }); // Fallback for now as year might be irrelevant or same
                break;
            default:
                query = query.order('created_at', { ascending: false });
        }

        const { data } = await query.limit(100);
        return data || [];
    },
    ['deity-ringtones-v2'],
    { revalidate: 3600 }
);

export default async function DeityRingtonesList({
    deityName,
    sort
}: {
    deityName: string;
    sort?: string;
}) {
    const ringtones = await getDeityRingtones(deityName, sort);

    if (!ringtones || ringtones.length === 0) {
        return (
            <div className="text-center py-20 text-zinc-500">
                No devotional ringtones found for {deityName}.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {ringtones.map((ringtone) => (
                <RingtoneCard key={ringtone.id} ringtone={ringtone} />
            ))}
        </div>
    );
}
