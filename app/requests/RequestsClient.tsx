'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, Plus, Music, Clock, User, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { formatDistanceToNow } from 'date-fns';
import { M3Card, M3FAB, M3Badge, M3Button } from '@/components/ui/m3';
import { fulfillRequest } from '@/app/actions/requests';

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

export default function RequestsClient() {
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
        } catch {
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
        <div className="max-w-md mx-auto min-h-screen bg-background text-foreground pb-24">
            {/* M3 Top App Bar */}
            <div className="sticky top-0 z-20 bg-m3-surface/90 backdrop-blur-md border-b border-m3-outline-variant/30 h-16 px-4 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-2">
                    <Link
                        href="/"
                        className="w-10 h-10 rounded-full flex items-center justify-center text-m3-on-surface hover:bg-m3-on-surface/8 transition-colors active:scale-90"
                        aria-label="Back"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-lg font-bold text-m3-on-surface tracking-tight">Ringtone Requests</h1>
                </div>

                {/* M3 Small FAB */}
                <M3FAB
                    size="small"
                    variant="primary"
                    icon={<Plus size={20} />}
                    onClick={() => setShowForm(true)}
                    aria-label="Ask for ringtone"
                />
            </div>

            {/* Content */}
            <div className="p-4 space-y-5">
                {showForm ? (
                    <M3Card variant="elevated" className="bg-m3-surface-container-high p-6 rounded-3xl animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-m3-on-surface">Ask for a Ringtone</h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-m3-outline hover:text-m3-on-surface hover:bg-m3-on-surface/8 transition-colors cursor-pointer"
                            >
                                <Plus size={20} className="rotate-45" />
                            </button>
                        </div>
                        <RequestForm onComplete={() => { setShowForm(false); fetchRequests(); }} />
                    </M3Card>
                ) : (
                    <div className="space-y-4">
                        {/* M3 Filled Info Card */}
                        <M3Card variant="filled" className="p-4 bg-m3-surface-container-high rounded-2xl border-none">
                            <p className="text-xs sm:text-sm text-m3-on-surface-variant font-normal leading-relaxed">
                                Can&apos;t find your favorite BGM? Post a request below! Our community creators will help you out.
                            </p>
                        </M3Card>

                        {error ? (
                            <div className="bg-m3-error-container text-m3-on-error-container border border-m3-error/20 p-4 rounded-2xl text-xs flex items-center gap-3">
                                <AlertCircle size={18} className="shrink-0" />
                                <p className="font-medium">{error}</p>
                                <button onClick={() => fetchRequests()} className="underline font-bold ml-auto cursor-pointer">Retry</button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between px-1">
                                    <h2 className="text-[11px] font-bold text-m3-outline uppercase tracking-wider">Recent Requests</h2>
                                    <M3Badge variant="surface">{requests.length} Requests</M3Badge>
                                </div>

                                {loading ? (
                                    <div className="space-y-3 animate-pulse">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-24 bg-m3-surface-container-low rounded-2xl border border-m3-outline-variant/30" />
                                        ))}
                                    </div>
                                ) : requests.length === 0 ? (
                                    <div className="text-center py-20 text-m3-outline">
                                        <Music size={40} className="mx-auto mb-4 opacity-30 text-m3-outline" />
                                        <p className="text-sm font-medium">No requests yet. Be the first!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {requests.map((req) => (
                                            <M3Card
                                                key={req.id}
                                                variant="outlined"
                                                className="p-4 bg-m3-surface-container-low hover:bg-m3-surface-container border-m3-outline-variant/40 rounded-2xl transition-all group"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="font-bold text-sm sm:text-base text-m3-on-surface truncate group-hover:text-m3-primary transition-colors">
                                                            {req.song_name}
                                                        </h3>
                                                        <p className="text-xs text-m3-outline truncate mt-0.5 font-normal">
                                                            Movie: <span className="text-m3-on-surface-variant font-medium">{req.movie_name}</span>
                                                        </p>
                                                    </div>
                                                    <M3Badge variant={req.status === 'fulfilled' ? 'tertiary' : 'primary'}>
                                                        {req.status === 'pending' ? 'Open' : req.status}
                                                    </M3Badge>
                                                </div>

                                                {isAdmin && req.status === 'pending' && (
                                                    <M3Button
                                                        variant="tonal"
                                                        onClick={() => handleFulfill(req.id)}
                                                        className="mt-3 w-full h-8 text-xs font-semibold"
                                                    >
                                                        Mark as Fulfilled
                                                    </M3Button>
                                                )}

                                                {req.description && (
                                                    <p className="mt-2.5 text-xs text-m3-on-surface-variant/80 italic line-clamp-2 leading-relaxed bg-m3-surface-container p-2.5 rounded-xl border border-m3-outline-variant/20">
                                                        &quot;{req.description}&quot;
                                                    </p>
                                                )}

                                                <div className="mt-3 pt-2.5 border-t border-m3-outline-variant/30 flex items-center justify-between text-[10px] text-m3-outline font-medium">
                                                    <div className="flex items-center gap-1.5">
                                                        <User size={12} />
                                                        <span>{getProfileName(req.profiles)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={12} />
                                                        <span>{safeTimeAgo(req.created_at)}</span>
                                                    </div>
                                                </div>
                                            </M3Card>
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
