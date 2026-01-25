import React from 'react';
import SimilarRingtones from '@/components/SimilarRingtones';
import { getSimilarRingtones } from '@/app/actions/ringtones';
import { Ringtone } from '@/types';

export default async function SimilarRingtonesSection({ ringtone }: { ringtone: Ringtone }) {
    const similarRingtones = await getSimilarRingtones(ringtone);

    return (
        <SimilarRingtones ringtones={similarRingtones} />
    );
}
