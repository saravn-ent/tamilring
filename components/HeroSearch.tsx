'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import DiscoverySearch from './DiscoverySearch';

export default function HeroSearch() {
    const router = useRouter();

    return (
        <div className="w-full px-4 pt-8 pb-10 md:pt-12 md:pb-14 bg-white rounded-b-[2.5rem] shadow-sm mb-6 border-b border-white/50">
            <div className="max-w-2xl mx-auto text-center space-y-6">

                {/* Visual Headline */}
                <h2 className="text-3xl md:text-4xl font-black text-brand-dark tracking-tight">
                    Find Your <span className="text-brand-accent">Ringtone</span>
                </h2>

                {/* Subtitle */}
                <p className="text-zinc-500 text-sm md:text-base font-medium max-w-md mx-auto">
                    Search classic movie dialogues, love instrumentals, and trending Tamil hits.
                </p>

                {/* Search Bar - Now using DiscoverySearch for Universal results */}
                <div className="max-w-lg mx-auto w-full">
                    <DiscoverySearch />
                </div>

                {/* Quick Tags - Optional but adds to 'density' */}
                <div className="flex flex-wrap justify-center gap-2 text-xs md:text-sm text-zinc-500 font-medium">
                    <span>Trending:</span>
                    <button onClick={() => router.push('/mood/Love')} className="hover:text-brand-accent transition-colors">#Love</button>
                    <button onClick={() => router.push('/category/bgm')} className="hover:text-brand-accent transition-colors">#BGM</button>
                    <button onClick={() => router.push('/artist/Anirudh%20Ravichander')} className="hover:text-brand-accent transition-colors">#Anirudh</button>
                </div>

            </div>
        </div>
    );
}
