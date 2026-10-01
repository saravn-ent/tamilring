'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Clapperboard, Music } from 'lucide-react';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';

export default function ViewToggle() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentView = searchParams.get('view') || 'movies';

    const handleToggle = (view: string) => {
        hapticFeedback(hapticPatterns.selection);
        const params = new URLSearchParams(searchParams.toString());
        params.set('view', view);
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="flex bg-m3-surface-container p-1 rounded-full border border-m3-outline-variant/40 shadow-2xs">
            <button
                onClick={() => handleToggle('movies')}
                className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                    currentView === 'movies'
                        ? 'bg-m3-secondary-container text-m3-on-secondary-container shadow-2xs'
                        : 'text-m3-on-surface-variant hover:text-m3-on-surface'
                }`}
            >
                <Clapperboard size={13} strokeWidth={2.2} />
                <span>Movies</span>
            </button>
            <button
                onClick={() => handleToggle('rings')}
                className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                    currentView === 'rings'
                        ? 'bg-m3-secondary-container text-m3-on-secondary-container shadow-2xs'
                        : 'text-m3-on-surface-variant hover:text-m3-on-surface'
                }`}
            >
                <Music size={13} strokeWidth={2.2} />
                <span>Ringtones</span>
            </button>
        </div>
    );
}

