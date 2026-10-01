'use client';

import React from 'react';
import { Smartphone, ShieldCheck, Sparkles, Sliders } from 'lucide-react';

export default function AudioTrustBadge() {
    return (
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 mb-3 sm:mb-4">
            <div className="bg-gradient-to-r from-m3-surface-container-low via-m3-surface-container to-m3-surface-container-low border border-m3-outline-variant/25 rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-2xs">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                    {/* Feature 1: iPhone native */}
                    <div className="flex items-center gap-2 sm:gap-2.5">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-m3-primary/10 text-m3-primary flex items-center justify-center shrink-0">
                            <span className="text-xs">🍏</span>
                        </div>
                        <div className="text-left min-w-0">
                            <p className="text-[11px] sm:text-xs font-bold text-m3-on-surface leading-tight truncate">iPhone Native</p>
                            <p className="text-[9px] sm:text-[10px] text-m3-outline leading-tight truncate">Direct .m4r ringtones</p>
                        </div>
                    </div>

                    {/* Feature 2: Android 1-Tap */}
                    <div className="flex items-center gap-2 sm:gap-2.5">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <Smartphone size={13} className="sm:w-3.5 sm:h-3.5" />
                        </div>
                        <div className="text-left min-w-0">
                            <p className="text-[11px] sm:text-xs font-bold text-m3-on-surface leading-tight truncate">Android Ready</p>
                            <p className="text-[9px] sm:text-[10px] text-m3-outline leading-tight truncate">1-tap .mp3 downloads</p>
                        </div>
                    </div>

                    {/* Feature 3: Speaker Mastered */}
                    <div className="flex items-center gap-2 sm:gap-2.5">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <Sliders size={13} className="sm:w-3.5 sm:h-3.5" />
                        </div>
                        <div className="text-left min-w-0">
                            <p className="text-[11px] sm:text-xs font-bold text-m3-on-surface leading-tight truncate">Studio Mastered</p>
                            <p className="text-[9px] sm:text-[10px] text-m3-outline leading-tight truncate">Tuned for speakers</p>
                        </div>
                    </div>

                    {/* Feature 4: 100% Ad-Safe */}
                    <div className="flex items-center gap-2 sm:gap-2.5">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <ShieldCheck size={13} className="sm:w-3.5 sm:h-3.5" />
                        </div>
                        <div className="text-left min-w-0">
                            <p className="text-[11px] sm:text-xs font-bold text-m3-on-surface leading-tight truncate">Zero Spam</p>
                            <p className="text-[9px] sm:text-[10px] text-m3-outline leading-tight truncate">No redirects or ads</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
