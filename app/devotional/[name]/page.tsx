'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import RingtoneCard from '@/components/RingtoneCard';
import { Loader2, ChevronLeft, Music, Sparkles } from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';

export default function DeityPage() {
    const params = useParams();
    const router = useRouter();
    const deityName = decodeURIComponent(params.name as string);
    const [ringtones, setRingtones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRingtones = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('ringtones')
                    .select('*')
                    .eq('status', 'approved')
                    .contains('tags', ['Devotional'])
                    .eq('movie_name', deityName)
                    .order('likes', { ascending: false });

                if (error) throw error;
                setRingtones(data || []);
            } catch (err) {
                console.error('Error fetching deity ringtones:', err);
            } finally {
                setLoading(false);
            }
        };

        if (deityName) fetchRingtones();
    }, [deityName]);

    return (
        <div className="min-h-screen bg-brand-wash pb-20">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-brand-border px-4 py-4 flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-brand-wash rounded-full transition-colors"
                >
                    <ChevronLeft size={24} className="text-brand-dark" />
                </button>
                <div>
                    <h1 className="text-lg font-black text-brand-dark uppercase tracking-tight leading-none">{deityName}</h1>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Divine Collections</p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Visual Banner Area */}
                <div className="mb-8 p-6 rounded-3xl bg-white border border-brand-border shadow-sm flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-brand-wash flex items-center justify-center text-5xl mb-4 shadow-inner border-2 border-white">
                        <Sparkles size={32} className="text-brand-accent animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight mb-2">
                        {deityName} Devotional Hits
                    </h2>
                    <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                        A curated collection of divine ringtones and spiritual melodies dedicated to {deityName}.
                    </p>
                </div>

                {/* Results Grid */}
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="animate-spin text-brand-accent" size={40} />
                        <p className="text-sm text-zinc-400 font-medium">Invoking divine melodies...</p>
                    </div>
                ) : ringtones.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">{ringtones.length} Ringtones</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {ringtones.map(ringtone => (
                                <RingtoneCard key={ringtone.id} ringtone={ringtone} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-brand-border">
                        <Music size={48} className="text-zinc-200 mx-auto mb-4" />
                        <p className="text-zinc-500 font-medium">No ringtones found for {deityName} yet.</p>
                        <p className="text-zinc-400 text-xs mt-1">Be the first to upload a divine song!</p>
                    </div>
                )}
            </main>
        </div>
    );
}
