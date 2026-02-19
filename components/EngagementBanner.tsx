'use client';

import { useState, useEffect } from 'react';
import { X, Upload, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export default function EngagementBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('engagement_banner_dismissed') === 'true';
    });
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

    const handleDismiss = () => {
        setIsDismissed(true);
        localStorage.setItem('engagement_banner_dismissed', 'true');
    };

    if (!isVisible || isDismissed || isRewarded) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-brand-dark rounded-2xl p-5 shadow-2xl shadow-brand-dark/40 border border-white/10 relative overflow-hidden group max-w-lg mx-auto">
                {/* Background Decor */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-accent/20 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                        <Upload className="text-brand-accent" size={24} />
                    </div>

                    <div className="flex-1 min-w-0 pr-8">
                        <h3 className="text-white font-bold text-base mb-0.5">Start Earning Money!</h3>
                        <p className="text-zinc-300 text-xs leading-relaxed">
                            {user
                                ? "Upload your first ringtone and get ₹15 instantly."
                                : "Join & upload high-quality ringtones to earn ₹15 per approval."}
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                        <Link
                            href={user ? "/profile?tab=upload" : "/profile"}
                            className="bg-brand-accent text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-brand-accent/90 transition-all shadow-lg shadow-brand-accent/20 active:scale-95 whitespace-nowrap"
                        >
                            Start Now <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>

                {/* Big Close Button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                    aria-label="Dismiss banner"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}
