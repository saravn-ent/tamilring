'use client';

import React from 'react';
import { Ringtone } from '@/types';
import TrendingRankCard from './TrendingRankCard';

interface TrendingListProps {
    trending: Ringtone[];
}

export default function TrendingList({ trending }: TrendingListProps) {
    if (!trending || trending.length === 0) return null;

    // Group into columns of 3 tracks each
    const chunkSize = 3;
    const columns: Ringtone[][] = [];
    for (let i = 0; i < trending.length; i += chunkSize) {
        columns.push(trending.slice(i, i + chunkSize));
    }

    return (
        <div className="relative">
            {/* Multi-Row Paginated Leaderboard Rail */}
            <div className="flex gap-3 sm:gap-4 overflow-x-auto px-3 sm:px-4 pb-3 scrollbar-hide snap-x md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:overflow-visible">
                {columns.map((column, colIdx) => (
                    <div
                        key={colIdx}
                        className="snap-start shrink-0 w-[86vw] sm:w-[350px] md:w-auto flex flex-col gap-2"
                    >
                        {column.map((ringtone, itemIdx) => {
                            const rank = colIdx * chunkSize + itemIdx + 1;
                            return (
                                <TrendingRankCard
                                    key={ringtone.id}
                                    ringtone={ringtone}
                                    rank={rank}
                                    priority={rank <= 3}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
