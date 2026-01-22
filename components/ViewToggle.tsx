'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Clapperboard, Music } from 'lucide-react';

export default function ViewToggle() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentView = searchParams.get('view') || 'movies'; // Default to movies

    const handleToggle = (view: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('view', view);
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="flex bg-zinc-100 p-0.5 rounded-full border border-zinc-200/50">
            <button
                onClick={() => handleToggle('movies')}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full text-[11px] font-bold transition-all duration-300 ${currentView === 'movies'
                    ? 'bg-white text-brand-dark shadow-sm'
                    : 'text-zinc-500 hover:text-brand-dark'
                    }`}
            >
                <Clapperboard size={12} strokeWidth={2.5} />
                movies
            </button>
            <button
                onClick={() => handleToggle('rings')}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full text-[11px] font-bold transition-all duration-300 ${currentView === 'rings'
                    ? 'bg-white text-brand-dark shadow-sm'
                    : 'text-zinc-500 hover:text-brand-dark'
                    }`}
            >
                <Music size={12} strokeWidth={2.5} />
                rings
            </button>
        </div>
    );
}
