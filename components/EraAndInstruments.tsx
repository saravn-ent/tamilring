'use client';

import Link from 'next/link';
import { Wind, Guitar, Keyboard, AudioWaveform } from 'lucide-react';
import SectionHeader from './SectionHeader';
import { ERAS, INSTRUMENTS } from '@/lib/constants';

const ICON_MAP: Record<string, any> = {
    flute: Wind,
    violin: AudioWaveform,
    guitar: Guitar,
    piano: Keyboard
};


export default function EraAndInstruments() {
    return (
        <div className="space-y-8 mb-10 px-4">
            {/* By Era Section */}
            <section>
                <div className="mb-4 px-1">
                    <h2 className="text-lg font-bold text-brand-dark">By Era</h2>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {ERAS.map((era) => {
                        // Explicitly defining colors here to ensure Tailwind JIT picks them up
                        let colorClass = era.color;
                        // 70s: Groovy/Warm (Amber/Orange/Yellow) - Lighter
                        if (era.label === '70s') colorClass = "from-amber-400 via-orange-400 to-yellow-500";
                        // 80s: Neon/Synthwave (Fuchsia/Purple/Cyan) - Vibrant
                        if (era.label === '80s') colorClass = "from-fuchsia-400 via-pink-500 to-purple-500";
                        // 90s: Pop/Memphis (Blue/Indigo/Purple) - Playful
                        if (era.label === '90s') colorClass = "from-blue-400 via-indigo-400 to-purple-400";
                        // 2ks: Y2K/Digital (Sky/Cyan/Blue) - Holographic
                        if (era.label === '2ks') colorClass = "from-sky-300 via-cyan-300 to-blue-400";
                        // 2k10s: Minimal/Clean (Teal/Emerald/Green) - Fresh
                        if (era.label === '2k10s') colorClass = "from-teal-300 via-emerald-400 to-green-400";
                        // 2k20s: Modern/Sleek (Gray/Slate/Zinc) - Solid but light
                        if (era.label === '2k20s') colorClass = "from-gray-600 via-slate-600 to-zinc-700";

                        return (
                            <Link
                                key={era.label}
                                href={`/search?q=${encodeURIComponent(era.label)}&hideSearch=true`}
                                className={`relative h-20 rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-br ${colorClass} hover:scale-[1.02] transition-transform shadow-sm group`}
                            >
                                <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors" />
                                <span className="relative text-lg font-black italic text-white tracking-widest opacity-100 drop-shadow-md">{era.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </section>

            {/* Instruments Section */}
            <section>
                <div className="mb-4 px-1">
                    <h2 className="text-lg font-bold text-brand-dark">Instruments</h2>
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {INSTRUMENTS.map((inst) => (
                        <Link
                            key={inst.label}
                            href={`/search?q=${encodeURIComponent(inst.query)}&hideSearch=true`}
                            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-zinc-100 shadow-sm hover:shadow-md hover:border-brand-accent/30 transition-all"
                        >
                            <div className="w-10 h-10 rounded-full bg-brand-wash flex items-center justify-center text-brand-accent">
                                {ICON_MAP[inst.query] && (
                                    (() => {
                                        const Icon = ICON_MAP[inst.query];
                                        return <Icon size={20} strokeWidth={2} />;
                                    })()
                                )}
                            </div>
                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wide">{inst.label}</span>
                        </Link>

                    ))}
                </div>
            </section>
        </div>
    );
}
