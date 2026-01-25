import React from 'react';
import RingtoneCard from '@/components/RingtoneCard';
import { supabase } from '@/lib/supabaseClient';

export default async function MovieRingtonesList({
    movieName,
    sort
}: {
    movieName: string;
    sort?: string;
}) {
    let query = supabase
        .from('ringtones')
        .select('*')
        .eq('status', 'approved')
        .eq('movie_name', movieName);

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

    const { data: ringtones } = await query;

    if (!ringtones || ringtones.length === 0) {
        return (
            <div className="text-center py-20 text-zinc-500">
                No ringtones found.
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
