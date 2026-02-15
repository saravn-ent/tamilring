'use client';

import { useState } from 'react';
import { useMounted } from '@/lib/hooks/use-mounted';
import Link from 'next/link';
import { Sparkles, ChevronRight } from 'lucide-react';

const REL_DATA = [
    { label: 'Hindu', emoji: '🕉️', id: 'Hindu' as const },
    { label: 'Christian', emoji: '✝️', id: 'Christian' as const },
    { label: 'Muslim', emoji: '☪️', id: 'Muslim' as const },
    { label: 'Buddhist', emoji: '☸️', id: 'Buddhist & Jain' as const },
    { label: 'Others', emoji: '✨', id: 'Other' as const }
];

import { DEITY_CATEGORIES } from '@/lib/constants';

type ReligionId = (typeof REL_DATA)[number]['id'];

const EMOJI_MAP: Record<string, string> = {
    'Murugan': '🏹', 'Siva': '🕉️', 'Krishna': '🦚', 'Amman': '🔱',
    'Vinayagar': '🐘', 'Ayyappan': '🐯', 'Vishnu': '🐚', 'Rama': '🏹',
    'Hanuman': '🎋', 'Jesus': '✝️', 'Mary': '🌹', 'Allah': '☪️',
    'Buddha': '☸️', 'Mahavira': '💎'
};

export default function DevotionalHub() {
    const [activeRelId, setActiveRelId] = useState<ReligionId | null>(null);
    const mounted = useMounted();

    // Return nothing during SSR to prevent hydration mismatches
    if (!mounted) return null;

    // Safely get deities for the active religion
    const getDeities = (): string[] => {
        if (!activeRelId) return [];
        if (activeRelId === 'Other') return [];
        const found = DEITY_CATEGORIES[activeRelId as Exclude<ReligionId, 'Other'>];
        return Array.isArray(found) ? found : [];
    };

    const deities = getDeities();

    return (
        <section className="mb-14 px-4" id="devotional-section">
            <div className="mb-6">
                <h2 className="text-xl font-black text-brand-dark uppercase tracking-tight flex items-center gap-2">
                    <Sparkles size={20} className="text-brand-accent animate-pulse" />
                    Devotional Hub
                </h2>
                <p className="text-xs text-zinc-500 font-medium">Explore Divine Melodies</p>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x -mx-1 px-1">
                {REL_DATA.map((rel) => {
                    const isActive = activeRelId === rel.id;
                    return (
                        <button
                            key={rel.id + rel.label}
                            onClick={() => setActiveRelId(isActive ? null : rel.id)}
                            className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all shrink-0 w-24 snap-start ${isActive
                                ? 'bg-brand-accent border-brand-accent shadow-lg shadow-brand-accent/20'
                                : 'bg-white border-zinc-100 shadow-sm hover:border-brand-accent/30'
                                }`}
                        >
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl transition-transform ${isActive ? 'bg-white/20' : 'bg-brand-wash shadow-inner'
                                }`}>
                                {rel.emoji || '✨'}
                            </div>
                            <span className={`text-[11px] font-black uppercase tracking-wide ${isActive ? 'text-white' : 'text-zinc-600'
                                }`}>
                                {rel.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {activeRelId && (deities?.length ?? 0) > 0 && (
                <div className="mt-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest">
                            {activeRelId} Divine Melodies
                        </span>
                        <ChevronRight size={14} className="text-zinc-300" />
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide snap-x -mx-1 px-1">
                        {deities.map((item) => (
                            <Link
                                key={`deity-${item}`}
                                href={`/devotional/${encodeURIComponent(item || '')}`}
                                className="flex flex-col items-center gap-3 p-3 rounded-2xl bg-white border border-zinc-100 shadow-sm hover:shadow-md hover:border-brand-accent/30 transition-all group shrink-0 w-24 snap-start"
                            >
                                <div className="w-12 h-12 rounded-full bg-brand-wash flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner border border-white">
                                    {EMOJI_MAP[item] || '🕉️'}
                                </div>
                                <span className="text-[10px] font-bold text-zinc-600 uppercase text-center truncate w-full block">
                                    {item}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
