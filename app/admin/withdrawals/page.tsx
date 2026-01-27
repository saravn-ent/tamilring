'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2, TrendingUp, CircleCheck, CircleX, User, Clock, Search, CircleAlert } from 'lucide-react';
import { updateWithdrawalStatus } from '@/app/actions/admin';
import Image from 'next/image';
import { Withdrawal } from '@/types';

export default function AdminWithdrawals() {
    const [loading, setLoading] = useState(true);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [filter, setFilter] = useState<'pending' | 'completed' | 'rejected'>('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    const supabase = useMemo(() => createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ), []);

    const fetchWithdrawals = useCallback(async () => {
        setLoading(true);
        try {
            console.log("Fetching withdrawals for status:", filter);
            const { data, error } = await supabase
                .from('withdrawals')
                .select(`
                    *,
                    profile:profiles!user_id (
                        full_name,
                        avatar_url,
                        points
                    )
                `)
                .eq('status', filter)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Supabase Error fetching withdrawals (Relations):", error);
                // Fallback: Fetch without relation if relation fails
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from('withdrawals')
                    .select('*')
                    .eq('status', filter)
                    .order('created_at', { ascending: false });

                if (fallbackError) {
                    console.error("Critical: Fallback fetch also failed:", fallbackError);
                    throw fallbackError;
                }
                console.warn("Fallback fetch successful. Relations might be broken.", fallbackData);
                // Manually map to prevent UI crash
                const mapped = fallbackData?.map(w => ({ ...w, profile: { full_name: 'Unknown User (Join Failed)', avatar_url: null, points: 0 } }));
                setWithdrawals((mapped as unknown as Withdrawal[]) || []);
                return;
            }

            console.log("Withdrawals fetched successfully:", data?.length);
            setWithdrawals((data as unknown as Withdrawal[]) || []);
        } catch (error) {
            console.error("Error fetching withdrawals:", error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchWithdrawals();
    }, [fetchWithdrawals]);

    const handleAction = async (id: string, status: 'completed' | 'rejected') => {
        if (!confirm(`Are you sure you want to mark this as ${status}?`)) return;

        setProcessingId(id);
        try {
            const res = await updateWithdrawalStatus(id, status);
            if (res.success) {
                setWithdrawals(prev => prev.filter(w => w.id !== id));
            } else {
                alert(res.error || 'Failed to update status');
            }
        } catch (err) {
            alert('An error occurred');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredWithdrawals = withdrawals.filter(w =>
        w.upi_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Withdrawal Requests</h1>
                    <p className="text-slate-500 text-sm">Process and manage user payout requests.</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    {(['pending', 'completed', 'rejected'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
                                ${filter === t
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="relative max-w-md group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Search by User or UPI ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                    <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Fetching Ledgers...</p>
                </div>
            ) : filteredWithdrawals.length === 0 ? (
                <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-3xl">
                    <TrendingUp size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">No withdrawal requests found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredWithdrawals.map((w) => (
                        <div key={w.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-200 transition-all group shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                        {w.profile?.avatar_url ? (
                                            <Image src={w.profile.avatar_url} alt="User" width={48} height={48} className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <User size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-0.5">{w.profile?.full_name || 'Legacy User'}</h3>
                                        <div className="flex items-center gap-3 text-xs">
                                            <span className="text-indigo-600 font-mono font-bold">UPI: {w.upi_id}</span>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-slate-500 flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(w.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-x-8 gap-y-4 w-full md:w-auto">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Payout Amount</p>
                                        <p className="text-2xl font-black text-slate-900">₹{w.amount}</p>
                                    </div>

                                    {filter === 'pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                disabled={processingId === w.id}
                                                onClick={() => handleAction(w.id, 'completed')}
                                                className="h-11 px-6 bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm shadow-emerald-500/20"
                                            >
                                                {processingId === w.id ? <Loader2 size={16} className="animate-spin" /> : <CircleCheck size={16} />}
                                                Mark Paid
                                            </button>
                                            <button
                                                disabled={processingId === w.id}
                                                onClick={() => handleAction(w.id, 'rejected')}
                                                className="h-11 px-4 bg-red-50 text-red-600 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-red-100 transition-all disabled:opacity-50 flex items-center gap-2 border border-red-200"
                                            >
                                                <CircleX size={16} />
                                                Reject
                                            </button>
                                        </div>
                                    )}

                                    {filter !== 'pending' && (
                                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border
                                            ${filter === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                            {filter}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Summary Banner */}
            {filter === 'pending' && filteredWithdrawals.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-12 md:translate-x-0 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-slate-800">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Payout Pending</span>
                            <span className="text-2xl font-black tracking-tight text-white">₹{filteredWithdrawals.reduce((acc, curr) => acc + curr.amount, 0)}</span>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requests</span>
                            <span className="text-2xl font-black tracking-tight text-white">{filteredWithdrawals.length}</span>
                        </div>
                        <CircleAlert className="text-red-500" />
                    </div>
                </div>
            )}
        </div>
    );
}
