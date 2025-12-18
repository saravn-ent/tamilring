'use client';

import { useState, useEffect } from 'react';
import { Sparkles, X, Upload, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export default function EngagementBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isRewarded, setIsRewarded] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        // 1. Check if user is logged in and already rewarded
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_first_upload_rewarded')
                    .eq('id', user.id)
                    .single();

                if (profile?.is_first_upload_rewarded) {
                    setIsRewarded(true);
                }
            }
        };
        checkUser();

        // 2. Set timer for 1 minute (60,000 ms)
        const timer = setTimeout(() => {
            if (!isDismissed && !isRewarded) {
                setIsVisible(true);
            }
        }, 60000);

        return () => clearTimeout(timer);
    }, [isDismissed, isRewarded]);

    if (!isVisible || isDismissed || isRewarded) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 shadow-2xl shadow-emerald-500/20 border border-emerald-400/30 relative overflow-hidden group">
                {/* Background Sparkles */}
                <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Sparkles size={48} className="text-white" />
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shrink-0">
                        <Upload className="text-white" size={24} />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-white font-bold text-sm">Earn 15 Rep Points!</h3>
                        <p className="text-emerald-50 text-[10px] leading-tight">
                            {user
                                ? "Upload your first ringtone and get 15 Rep immediately!"
                                : "Join & Upload to earn 15 Rep for every approved ringtone!"}
                        </p>
                    </div>

                    <Link
                        href={user ? "/profile?tab=upload" : "/profile"}
                        className="bg-white text-emerald-600 px-4 py-2 rounded-full text-xs font-black flex items-center gap-1 hover:bg-emerald-50 transition-colors shadow-lg"
                    >
                        Start <ArrowRight size={14} />
                    </Link>

                    <button
                        onClick={() => setIsDismissed(true)}
                        className="absolute -top-1 -right-1 p-2 text-white/50 hover:text-white"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
