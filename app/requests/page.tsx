'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, Plus, Music, Clock, User, CircleCheckBig, AlertCircle } from 'lucide-react';
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
    } | {
        full_name: string;
        avatar_url: string;
    }[] | null;
}

import { fulfillRequest } from '@/app/actions/requests';

export default function RequestsPage() {
    const [requests, setRequests] = useState<RingtoneRequest[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    async function fetchRequests() {
        setLoading(true);
        setError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                if (profile?.role === 'admin') setIsAdmin(true);
            }

            const { data, error: fetchError } = await supabase
                .from('ringtone_requests')
                .select('*, profiles(full_name, avatar_url)')
                .order('created_at', { ascending: false })
                .limit(50);

            if (fetchError) throw fetchError;
            if (data) setRequests(data as RingtoneRequest[]);

        } catch (err: any) {
            console.error("Error fetching requests:", err);
            setError(err.message || 'Failed to load requests');
        } finally {
            setLoading(false);
        }
    }

    const handleFulfill = async (id: string) => {
        if (!confirm('Mark as fulfilled?')) return;
        const res = await fulfillRequest(id);
        if (res.success) fetchRequests();
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const safeTimeAgo = (dateStr: string) => {
        try {
            if (!dateStr) return 'recently';
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return 'recently';
            return formatDistanceToNow(date) + ' ago';
        } catch (e) {
            return 'recently';
        }
    };

    const getProfileName = (profiles: any) => {
        if (!profiles) return 'User';
        if (Array.isArray(profiles)) {
            return profiles[0]?.full_name || 'User';
        }
        return profiles.full_name || 'User';
    };

    return (
        <div className="max-w-md mx-auto min-h-screen bg-white pb-20">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-brand-border p-4 flex items-center justify-between transition-colors duration-300">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2.5 hover:bg-brand-wash border border-transparent hover:border-brand-border rounded-full text-zinc-500 hover:text-brand-dark transition-colors">
                        <ArrowLeft size={20} strokeWidth={2.5} />
                    </Link>
                    <h1 className="text-xl font-black text-brand-dark tracking-tight">Ringtone Requests</h1>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-brand-dark text-white p-2.5 rounded-full shadow-lg shadow-brand-dark/20 active:scale-95 transition-all hover:bg-neutral-800"
                >
                    <Plus size={20} strokeWidth={2.5} />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
                {showForm ? (
                    <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-xl shadow-brand-dark/5 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-brand-dark">Ask for a Ringtone</h2>
                            <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-brand-dark transition-colors">
                                <Plus size={20} className="rotate-45" />
                            </button>
                        </div>
                        <RequestForm onComplete={() => { setShowForm(false); fetchRequests(); }} />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-brand-wash border border-brand-border p-5 rounded-2xl">
                            <p className="text-sm text-zinc-600 font-medium leading-relaxed">
                                Can&apos;t find your favorite BGM? Post a request below! Our community creators will help you out.
                            </p>
                        </div>

                        {error ? (
                            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 text-sm flex items-center gap-3">
                                <AlertCircle size={20} />
                                <p>{error}</p>
                                <button onClick={() => fetchRequests()} className="underline font-bold ml-auto">Retry</button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between px-1">
                                    <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Recent Requests</h2>
                                    <span className="text-[10px] bg-brand-wash text-brand-dark font-bold px-2 py-1 rounded-full border border-brand-border">{requests.length} Requests</span>
                                </div>

                                {loading ? (
                                    <div className="space-y-4 animate-pulse">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-24 bg-brand-wash rounded-2xl" />
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
                                            <div key={req.id} className="bg-white border border-brand-border rounded-2xl p-4 transition-all hover:shadow-md hover:border-brand-accent/30 group">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="font-bold text-brand-dark truncate group-hover:text-brand-accent transition-colors">
                                                            {req.song_name}
                                                        </h3>
                                                        <p className="text-sm text-zinc-500 truncate mt-0.5">
                                                            Movie: <span className="text-zinc-700 font-medium">{req.movie_name}</span>
                                                        </p>
                                                    </div>
                                                    <div className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${req.status === 'fulfilled'
                                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                        : 'bg-blue-50 text-blue-600 border border-blue-100'
                                                        }`}>
                                                        {req.status === 'pending' ? 'Open' : req.status}
                                                    </div>
                                                </div>

                                                {isAdmin && req.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleFulfill(req.id)}
                                                        className="mt-3 w-full py-2 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all"
                                                    >
                                                        MARK AS FULFILLED
                                                    </button>
                                                )}

                                                {req.description && (
                                                    <p className="mt-3 text-xs text-zinc-500 italic line-clamp-2 leading-relaxed bg-brand-wash/50 p-2 rounded-lg border border-transparent">
                                                        &quot;{req.description}&quot;
                                                    </p>
                                                )}

                                                <div className="mt-4 pt-3 border-t border-brand-wash flex items-center justify-between text-[10px] text-zinc-400 font-medium">
                                                    <div className="flex items-center gap-1.5">
                                                        <User size={12} />
                                                        <span>{getProfileName(req.profiles)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={12} />
                                                        <span>{safeTimeAgo(req.created_at)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

