import React from 'react';
import SimilarRingtones from '@/components/SimilarRingtones';
import { getSimilarRingtones } from '@/app/actions/ringtones';
import { Ringtone } from '@/types';
import { unstable_cache } from 'next/cache';

const getCachedSimilarRingtones = unstable_cache(
    async (
        id: string,
        tags: string[] | undefined,
        mood: string | undefined,
        music_director: string | undefined,
        movie_name: string | undefined
    ) => {
        return getSimilarRingtones({ id, tags, mood, music_director, movie_name });
    },
    ['similar-ringtones-v1'],
    { revalidate: 3600, tags: ['ringtones'] }
);

export default async function SimilarRingtonesSection({ ringtone }: { ringtone: Ringtone }) {
    const similarRingtones = await getCachedSimilarRingtones(
        ringtone.id,
        ringtone.tags,
        ringtone.mood,
        ringtone.music_director,
        ringtone.movie_name
    );

    return (
        <SimilarRingtones ringtones={similarRingtones} />
    );
}
