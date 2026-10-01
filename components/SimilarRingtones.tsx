'use client';

import { Ringtone } from '@/types';
import RingtoneCard from './RingtoneCard';
import { Sparkles } from 'lucide-react';

interface SimilarRingtonesProps {
    ringtones: Ringtone[];
}

export default function SimilarRingtones({ ringtones }: SimilarRingtonesProps) {
    if (!ringtones || ringtones.length === 0) return null;

    return (
        <section className="mt-10 mb-8 w-full max-w-md md:max-w-xl lg:max-w-2xl mx-auto px-1 sm:px-0">
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-m3-primary-container text-m3-on-primary-container flex items-center justify-center">
                        <Sparkles size={16} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-m3-on-surface tracking-tight leading-tight">Similar Ringtones</h2>
                        <p className="text-xs text-m3-outline">Recommended based on movie & artists</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:gap-2.5">
                {ringtones.map((ringtone) => (
                    <RingtoneCard key={ringtone.id} ringtone={ringtone} />
                ))}
            </div>
        </section>
    );
}

