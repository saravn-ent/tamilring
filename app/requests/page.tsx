'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, Plus, Music, Clock, User, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { formatDistanceToNow } from 'date-fns';

const RequestForm = dynamic(() => import('@/components/RequestForm'), { ssr: false });

interface RingtoneRequest {
    id: string;
    movie_name: string;
    song_name: string;
    description: string;
    status: 'pending' | 'fulfilled' | 'cancelled';
    created_at: string;
    profiles?: {
        full_name: string;
        avatar_url: string;
    };
}

import { fulfillRequest } from '@/app/actions/requests';

export default function RequestsPage() {
    const [requests, setRequests] = useState<RingtoneRequest[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    const fetchRequests = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
            if (profile?.role === 'admin') setIsAdmin(true);
        }
        const { data } = await supabase
            .from('ringtone_requests')
            .select('*, profiles(full_name, avatar_url)')
            .order('created_at', { ascending: false })
            .limit(50);

        if (data) setRequests(data as any);
        setLoading(false);
    };

    const handleFulfill = async (id: string) => {
        if (!confirm('Mark as fulfilled?')) return;
        const res = await fulfillRequest(id);
        if (res.success) fetchRequests();
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    return (
        <div className="max-w-md mx-auto min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-zinc-200 dark:border-neutral-800 p-4 flex items-center justify-between transition-colors duration-300">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-zinc-100 dark:hover:bg-neutral-800 rounded-full text-zinc-500 dark:text-zinc-400 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-xl font-bold text-foreground">Ringtone Requests</h1>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-emerald-500 text-white dark:text-neutral-900 p-2 rounded-full shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
                {showForm ? (
                    <div className="bg-zinc-50 dark:bg-neutral-800/50 p-6 rounded-2xl border border-zinc-200 dark:border-neutral-700 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-foreground">Ask for a Ringtone</h2>
                            <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-foreground transition-colors">
                                <Plus size={20} className="rotate-45" />
                            </button>
                        </div>
                        <RequestForm onComplete={() => { setShowForm(false); fetchRequests(); }} />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                            <p className="text-xs text-emerald-600 dark:text-emerald-500 font-medium leading-relaxed">
                                Can't find your favorite BGM? Post a request below! Our community creators will help you out.
                            </p>
                        </div>

                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Recent Requests</h2>
                            <span className="text-[10px] bg-zinc-100 dark:bg-neutral-800 text-zinc-500 px-2 py-0.5 rounded-full">{requests.length} Requests</span>
                        </div>

                        {loading ? (
                            <div className="space-y-4 animate-pulse">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-24 bg-zinc-100 dark:bg-neutral-800/50 rounded-2xl" />
                                ))}
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="text-center py-20 text-zinc-400">
                                <Music size={40} className="mx-auto mb-4 opacity-20" />
                                <p>No requests yet. Be the first!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {requests.map((req) => (
                                    <div key={req.id} className="bg-white dark:bg-neutral-800/40 border border-zinc-100 dark:border-neutral-800 rounded-2xl p-4 transition-all hover:shadow-md dark:hover:bg-neutral-800/60 group">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-bold text-foreground truncate group-hover:text-emerald-500 transition-colors">
                                                    {req.song_name}
                                                </h3>
                                                <p className="text-sm text-zinc-500 truncate">
                                                    Movie: <span className="text-zinc-600 dark:text-zinc-300">{req.movie_name}</span>
                                                </p>
                                            </div>
                                            <div className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${req.status === 'fulfilled'
                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500'
                                                : 'bg-blue-500/10 text-blue-600 dark:text-blue-500'
                                                }`}>
                                                {req.status === 'pending' ? 'Open' : req.status}
                                            </div>
                                        </div>

                                        {isAdmin && req.status === 'pending' && (
                                            <button
                                                onClick={() => handleFulfill(req.id)}
                                                className="mt-2 w-full py-1.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-500 text-[10px] font-bold rounded-lg border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all"
                                            >
                                                MARK AS FULFILLED
                                            </button>
                                        )}

                                        {req.description && (
                                            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 italic line-clamp-2 leading-relaxed">
                                                "{req.description}"
                                            </p>
                                        )}

                                        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-neutral-800 flex items-center justify-between text-[10px] text-zinc-400">
                                            <div className="flex items-center gap-1.5">
                                                <User size={12} />
                                                <span>{req.profiles?.full_name || 'User'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={12} />
                                                <span>{formatDistanceToNow(new Date(req.created_at))} ago</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
