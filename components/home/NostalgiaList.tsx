'use client';

import React from 'react';
import { Ringtone } from '@/types';
import ZeptoRingtoneCard from './ZeptoRingtoneCard';

interface NostalgiaListProps {
    nostalgia: Ringtone[];
}

export default function NostalgiaList({ nostalgia }: NostalgiaListProps) {
    if (!nostalgia || nostalgia.length === 0) return null;

    return (
        <div className="flex gap-2.5 sm:gap-3.5 overflow-x-auto px-3 sm:px-4 pb-3 scrollbar-hide snap-x md:grid md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 md:overflow-visible">
            {nostalgia.map((ringtone: Ringtone) => (
                <ZeptoRingtoneCard
                    key={ringtone.id}
                    ringtone={ringtone}
                    badge={ringtone.movie_year ? `${ringtone.movie_year}` : 'CLASSIC'}
                />
            ))}
        </div>
    );
}
