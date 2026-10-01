import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Music2 } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { Ringtone } from '@/types';
import { groupRingtonesBySong } from '@/lib/songGrouping';
import MovieGroupedTracksView from './MovieGroupedTracksView';

export default async function MovieRingtonesList({
    movieName,
    page = 1
}: {
    movieName: string;
    page?: number;
}) {
    const ITEMS_PER_PAGE = 40;
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data: ringtones, count } = await supabase
        .from('ringtones')
        .select('*', { count: 'exact' })
        .eq('status', 'approved')
        .eq('movie_name', movieName)
        .order('downloads', { ascending: false })
        .range(from, to);

    const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;

    if (!ringtones || ringtones.length === 0) {
        return (
            <div className="text-center py-16 px-4 bg-m3-surface-container-low rounded-3xl border border-m3-outline-variant/30 max-w-md mx-auto my-8">
                <div className="w-14 h-14 rounded-2xl bg-m3-primary/10 text-m3-primary flex items-center justify-center mx-auto mb-3 border border-m3-outline-variant/30">
                    <Music2 size={26} />
                </div>
                <h3 className="text-base font-bold text-m3-on-surface mb-1">No Ringtones Found</h3>
                <p className="text-xs text-m3-on-surface-variant max-w-xs mx-auto mb-5 leading-relaxed">
                    We haven&apos;t added approved ringtones for <span className="font-semibold text-m3-on-surface">{movieName}</span> yet. You can request one or explore other albums!
                </p>
                <div className="flex items-center justify-center gap-2">
                    <Link
                        href={`/requests?movie=${encodeURIComponent(movieName)}`}
                        className="m3-btn-filled h-9 px-4 text-xs font-bold"
                    >
                        Request Ringtone
                    </Link>
                    <Link
                        href="/categories"
                        className="m3-btn-tonal h-9 px-4 text-xs font-semibold"
                    >
                        Browse Movies
                    </Link>
                </div>
            </div>
        );
    }

    const typedRingtones = ringtones as Ringtone[];
    const songGroups = groupRingtonesBySong(typedRingtones, movieName);

    return (
        <div className="space-y-6">
            <MovieGroupedTracksView
                groups={songGroups}
                movieName={movieName}
            />

            {totalPages > 1 && (
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    baseUrl={`/movie/${encodeURIComponent(movieName)}`}
                />
            )}
        </div>
    );
}

