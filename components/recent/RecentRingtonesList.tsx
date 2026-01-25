import React from 'react';
import RingtoneCard from '@/components/RingtoneCard';
import { supabase } from '@/lib/supabaseClient';
import { Ringtone } from '@/types';

export default async function RecentRingtonesList({ sort }: { sort?: string }) {
    let query = supabase
        .from('ringtones')
        .select('*')
        .eq('status', 'approved');

    // Apply Sorting
    switch (sort) {
        case 'downloads':
            query = query.order('downloads', { ascending: false });
            break;
        case 'likes':
            query = query.order('likes', { ascending: false });
            break;
        case 'year_desc':
            query = query.order('movie_year', { ascending: false });
            break;
        case 'year_asc':
            query = query.order('movie_year', { ascending: true });
            break;
        default: // recent
            query = query.order('created_at', { ascending: false });
    }

    const { data: recent } = await query.limit(50);

    return (
        <div className="space-y-4">
            {recent?.map((ringtone: Ringtone) => (
                <RingtoneCard key={ringtone.id} ringtone={ringtone} />
            ))}
        </div>
    );
}
