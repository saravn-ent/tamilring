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
        <div className="flex bg-neutral-800/50 p-1 rounded-xl border border-white/5 backdrop-blur-sm">
            <button
                onClick={() => handleToggle('movies')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-bold transition-all ${currentView === 'movies'
                        ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                    }`}
            >
                <Clapperboard size={16} />
                Movies
            </button>
            <button
                onClick={() => handleToggle('songs')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-bold transition-all ${currentView === 'songs'
                        ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                    }`}
            >
                <Music size={16} />
                Songs
            </button>
        </div>
    );
}
