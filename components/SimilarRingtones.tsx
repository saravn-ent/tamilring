'use client';

import { Ringtone } from '@/types';
import RingtoneCard from './RingtoneCard';
import { Sparkles } from 'lucide-react';
import SectionHeader from './SectionHeader';

interface SimilarRingtonesProps {
    ringtones: Ringtone[];
}

export default function SimilarRingtones({ ringtones }: SimilarRingtonesProps) {
    if (!ringtones || ringtones.length === 0) return null;

    return (
        <div className="mt-12 mb-10 px-4">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#3EB0EF]/10 flex items-center justify-center text-[#3EB0EF]">
                    <Sparkles size={18} />
                </div>
                <h2 className="text-xl font-bold text-[#15171A] tracking-tight">AI Recommended</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ringtones.map((ringtone) => (
                    <RingtoneCard key={ringtone.id} ringtone={ringtone} />
                ))}
            </div>
        </div>
    );
}
