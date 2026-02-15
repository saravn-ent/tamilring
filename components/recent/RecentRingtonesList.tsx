import React from 'react';
import RingtoneCard from '@/components/RingtoneCard';
import { supabase } from '@/lib/supabaseClient';
import { Ringtone } from '@/types';

import Pagination from '@/components/Pagination';

export default async function RecentRingtonesList({ sort, page = 1 }: { sort?: string; page?: number }) {
    const ITEMS_PER_PAGE = 24;
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
        .from('ringtones')
        .select('*', { count: 'exact' })
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

    const { data: recent, count } = await query.range(from, to);
    const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;

    return (
        <div className="space-y-8">
            <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
                {recent?.map((ringtone: Ringtone) => (
                    <RingtoneCard key={ringtone.id} ringtone={ringtone} />
                ))}
            </div>

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl="/recent"
                searchParams={sort ? { sort } : {}}
            />
        </div>
    );
}
