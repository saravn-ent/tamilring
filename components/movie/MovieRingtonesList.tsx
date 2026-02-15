import React from 'react';
import RingtoneCard from '@/components/RingtoneCard';
import { supabase } from '@/lib/supabaseClient';

import Pagination from '@/components/Pagination';
import { Ringtone } from '@/types';

export default async function MovieRingtonesList({
    movieName,
    sort,
    page = 1
}: {
    movieName: string;
    sort?: string;
    page?: number;
}) {
    const ITEMS_PER_PAGE = 24;
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
        .from('ringtones')
        .select('*', { count: 'exact' })
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

    const { data: ringtones, count } = await query.range(from, to);
    const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;

    if (!ringtones || ringtones.length === 0) {
        return (
            <div className="text-center py-20 text-zinc-500">
                No ringtones found.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                {ringtones.map((ringtone: Ringtone) => (
                    <RingtoneCard key={ringtone.id} ringtone={ringtone} />
                ))}
            </div>

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl={`/movie/${encodeURIComponent(movieName)}`}
                searchParams={sort ? { sort } : {}}
            />
        </div>
    );
}
