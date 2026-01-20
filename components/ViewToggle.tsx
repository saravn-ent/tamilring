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
        <div className="flex bg-brand-wash p-1 rounded-xl border border-brand-border backdrop-blur-sm shadow-inner">
            <button
                onClick={() => handleToggle('movies')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${currentView === 'movies'
                    ? 'bg-brand-dark text-white shadow-md shadow-brand-dark/20'
                    : 'text-zinc-500 hover:text-brand-dark hover:bg-white border border-transparent hover:border-brand-gray/50 hover:shadow-sm'
                    }`}
            >
                <Clapperboard size={16} strokeWidth={2.5} />
                Movies
            </button>
            <button
                onClick={() => handleToggle('rings')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${currentView === 'rings'
                    ? 'bg-brand-dark text-white shadow-md shadow-brand-dark/20'
                    : 'text-zinc-500 hover:text-brand-dark hover:bg-white border border-transparent hover:border-brand-gray/50 hover:shadow-sm'
                    }`}
            >
                <Music size={16} strokeWidth={2.5} />
                Rings
            </button>
        </div>
    );
}
