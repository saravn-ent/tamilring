'use client';

import { Scissors, Sparkles, Music, Smartphone } from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';

export default function TrimPage() {
    return (
        <div className="max-w-xl mx-auto pb-24 px-4 pt-4">
            <SectionHeader title="Ringtone Cutter" />

            <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-8 mt-4 relative overflow-hidden shadow-2xl backdrop-blur-sm">

                {/* Coming Soon Content */}
                <div className="text-center space-y-6">
                    {/* Icon */}
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald-500/10">
                        <Scissors size={40} className="text-emerald-500" />
                    </div>

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <Sparkles size={16} className="text-emerald-500" />
                        <span className="text-sm font-bold text-emerald-500">Coming Soon</span>
                    </div>

                    {/* Title */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Audio Trimmer</h2>
                        <p className="text-zinc-400 text-sm max-w-md mx-auto">
                            We're building a powerful audio trimming tool that will let you cut and customize your ringtones with precision.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="bg-black/30 border border-white/5 rounded-2xl p-6 text-left">
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">What's Coming:</p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm text-zinc-400">
                                <Music size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                                <span>Trim audio to any length with waveform visualization</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-zinc-400">
                                <Smartphone size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                                <span>Export as MP3 (Android) or M4R (iPhone)</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-zinc-400">
                                <Scissors size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                                <span>Fade in/out effects and volume control</span>
                            </li>
                        </ul>
                    </div>

                    {/* CTA */}
                    <div className="pt-4">
                        <a
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all"
                        >
                            Browse Ringtones Instead
                        </a>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center">
                <p className="text-zinc-500 text-xs max-w-xs mx-auto">
                    In the meantime, browse our collection of pre-made ringtones ready to download!
                </p>
            </div>
        </div>
    );
}
