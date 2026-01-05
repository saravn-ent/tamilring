'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, TrendingUp, CheckCircle, XCircle, User, Clock, Search, AlertCircle } from 'lucide-react';
import { updateWithdrawalStatus } from '@/app/actions/admin';
import Image from 'next/image';

export default function AdminWithdrawals() {
    const [loading, setLoading] = useState(true);
    const [withdrawals, setWithdrawals] = useState<any[]>([]); // Keeping any[] for data from supabase for now, but fixing catch blocks
    const [filter, setFilter] = useState<'pending' | 'completed' | 'rejected'>('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);

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
                console.error("Supabase Error Detail:", error);
                // Specifically check for "not found"
                if (error.code === 'PGRST116' || error.message.includes('not found')) {
                    alert("Schema error: 'withdrawals' table not found in API. Please reload schema cache in Supabase.");
                }
                throw error;
            }
            console.log("Withdrawals fetched:", data?.length || 0);
            setWithdrawals(data || []);
        } catch (error) {
            console.error("Error fetching withdrawals:", error);
            // alert(`Failed to load: ${error.message || 'Unknown error'}`);
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
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Withdrawal Requests</h1>
                    <p className="text-zinc-400 text-sm">Process and manage user payout requests.</p>
                </div>

                <div className="flex items-center gap-2 bg-neutral-900 p-1 rounded-xl border border-white/5">
                    {(['pending', 'completed', 'rejected'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
                                ${filter === t
                                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                                    : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                    type="text"
                    placeholder="Search by User or UPI ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-700 shadow-sm"
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-emerald-500" size={32} />
                    <p className="text-zinc-600 font-mono text-xs uppercase tracking-widest">Fetching Ledgers...</p>
                </div>
            ) : filteredWithdrawals.length === 0 ? (
                <div className="text-center py-20 bg-neutral-900/50 border border-dashed border-white/5 rounded-3xl">
                    <TrendingUp size={48} className="mx-auto text-zinc-800 mb-4" />
                    <p className="text-zinc-500 font-medium">No withdrawal requests found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredWithdrawals.map((w) => (
                        <div key={w.id} className="bg-neutral-900 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-800 shrink-0 border border-white/10">
                                        {w.profile?.avatar_url ? (
                                            <Image src={w.profile.avatar_url} alt="User" width={48} height={48} className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                                <User size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white mb-0.5">{w.profile?.full_name || 'Legacy User'}</h3>
                                        <div className="flex items-center gap-3 text-xs">
                                            <span className="text-emerald-500 font-mono font-bold">UPI: {w.upi_id}</span>
                                            <span className="text-zinc-600">•</span>
                                            <span className="text-zinc-500 flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(w.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-x-8 gap-y-4 w-full md:w-auto">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Payout Amount</p>
                                        <p className="text-2xl font-black text-white">₹{w.amount}</p>
                                    </div>

                                    {filter === 'pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                disabled={processingId === w.id}
                                                onClick={() => handleAction(w.id, 'completed')}
                                                className="h-11 px-6 bg-emerald-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {processingId === w.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                                Mark Paid
                                            </button>
                                            <button
                                                disabled={processingId === w.id}
                                                onClick={() => handleAction(w.id, 'rejected')}
                                                className="h-11 px-4 bg-red-500/10 text-red-500 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
                                            >
                                                <XCircle size={16} />
                                                Reject
                                            </button>
                                        </div>
                                    )}

                                    {filter !== 'pending' && (
                                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border
                                            ${filter === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
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
                    <div className="bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-emerald-400/30">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-emerald-200 uppercase tracking-widest">Total Payout Pending</span>
                            <span className="text-2xl font-black tracking-tight">₹{filteredWithdrawals.reduce((acc, curr) => acc + curr.amount, 0)}</span>
                        </div>
                        <div className="w-px h-10 bg-white/20" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-emerald-200 uppercase tracking-widest">Requests</span>
                            <span className="text-2xl font-black tracking-tight">{filteredWithdrawals.length}</span>
                        </div>
                        <AlertCircle className="opacity-50" />
                    </div>
                </div>
            )}
        </div>
    );
}
