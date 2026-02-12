'use client';

import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Profile } from '@/types';
import {
    Search, Shield,
    User as UserIcon, Loader2, Music,
    Eye, History, Wallet, Coins, Star, CloudUpload, X, ArrowUpRight, CheckCircle
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getLevelTitle, syncUserGamification } from '@/lib/gamification';
import { toggleUserRole } from '@/app/actions/admin';
import { Withdrawal, Ringtone } from '@/types';

export default function UserManagement() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

    const supabase = useMemo(() => createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ), []);

    useEffect(() => {
        fetchUsers();
    }, [supabase]);

    async function fetchUsers() {
        setLoading(true);
        // Fetch profiles - 100 limit for now
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (data) setUsers(data as Profile[]);
        setLoading(false);
    }

    const filteredUsers = users.filter(u =>
        (u.full_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (u.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (u.id?.toLowerCase() || '').includes(search.toLowerCase())
    );

    const toggleAdmin = async (user: Profile) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        const action = newRole === 'admin' ? 'promote to Admin' : 'revoke Admin rights';

        if (!confirm(`Are you sure you want to ${action} for ${user.full_name || user.email}?`)) return;

        try {
            const res = await toggleUserRole(user.id, newRole);
            if (res.success) {
                setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
            } else {
                alert(res.error || "Failed to update user role.");
            }
        } catch (err: any) {
            console.error(err);
            alert(`Error: ${err.message || 'Unknown error'}`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-900">User Management</h1>

                {/* Search */}
                <div className="relative w-full md:w-64 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search name, email, ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500/50"
                    />
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20 text-indigo-600 bg-white border border-slate-200 rounded-2xl">
                    <Loader2 className="animate-spin" size={32} />
                </div>
            ) : (
                <>
                    {/* Mobile: Card View */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {filteredUsers.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-200">
                                No users found.
                            </div>
                        ) : filteredUsers.map((user) => (
                            <div key={user.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                            {user.avatar_url ? (
                                                <Image src={user.avatar_url} alt="avatar" fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    <UserIcon size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <button onClick={() => setSelectedUser(user)} className="font-bold text-slate-900 hover:text-indigo-600 transition-colors text-left">
                                                {user.full_name || 'No Name'}
                                            </button>
                                            <p className="text-xs text-slate-500 font-mono truncate max-w-[150px]">{user.email}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider
                                        ${user.role === 'admin' ? 'bg-purple-50 text-purple-600 border border-purple-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                        {user.role === 'admin' && <Shield size={10} />}
                                        {user.role || 'USER'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-slate-100">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Reputation</span>
                                        <div className="flex items-baseline gap-1 mt-1">
                                            <span className="text-emerald-600 font-bold text-lg">{user.points || 0}</span>
                                            <span className="text-[10px] text-slate-500">Points</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Level</span>
                                        <span className="text-amber-500 font-bold text-sm mt-1">{getLevelTitle(user.level || 1)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    <button
                                        onClick={() => setSelectedUser(user)}
                                        className="p-2 bg-slate-50 text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-100 transition-all flex items-center gap-2 text-xs font-bold"
                                    >
                                        <Eye size={16} />
                                        Details
                                    </button>
                                    <button
                                        onClick={() => toggleAdmin(user)}
                                        className={`text-xs font-bold px-4 py-2 rounded-lg border transition-all flex-1 max-w-[140px]
                                            ${user.role === 'admin'
                                                ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                                : 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100'
                                            }
                                        `}
                                    >
                                        {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop: Table View */}
                    <div className="hidden md:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider border-b border-slate-200">
                                <tr>
                                    <th className="p-4 pl-6">User</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Reputation</th>
                                    <th className="p-4">Joined</th>
                                    <th className="p-4 text-right pr-6">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-500">No users found.</td>
                                    </tr>
                                ) : filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                                    {user.avatar_url ? (
                                                        <Image src={user.avatar_url} alt="avatar" fill className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                            <UserIcon size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <button onClick={() => setSelectedUser(user)} className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors text-left">
                                                        {user.full_name || 'No Name'}
                                                    </button>
                                                    <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider
                            ${user.role === 'admin' ? 'bg-purple-50 text-purple-600 border border-purple-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                                {user.role === 'admin' && <Shield size={12} />}
                                                {user.role || 'USER'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="text-xs">
                                                    <span className="text-emerald-600 font-bold block">{user.points || 0} PTS</span>
                                                    <span className="text-slate-500 block">Lvl {user.level || 1}</span>
                                                </div>
                                                <div className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 font-medium">
                                                    {getLevelTitle(user.level || 1)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs text-slate-500">
                                                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right pr-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedUser(user)}
                                                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                                                    title="View Full Profile & Finances"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <Link
                                                    href={`/admin/ringtones?user_id=${user.id}`}
                                                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                                                    title="View Ringtones"
                                                >
                                                    <Music size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => toggleAdmin(user)}
                                                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors
                                    ${user.role === 'admin'
                                                            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                                            : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'
                                                        }
                                `}
                                                >
                                                    {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* User Detail Modal */}
            {selectedUser && (
                <UserDetailModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    supabase={supabase}
                />
            )}
        </div>
    );
}

function UserDetailModal({ user, onClose, supabase }: { user: Profile, onClose: () => void, supabase: any }) {
    const [loading, setLoading] = useState(true);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [uploads, setUploads] = useState<Ringtone[]>([]);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                // Fetch extra data
                const [withdrawalsRes, requestsRes, uploadsRes, gamificationRes] = await Promise.all([
                    supabase.from('withdrawals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
                    supabase.from('ringtone_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
                    supabase.from('ringtones').select('*').eq('user_id', user.id).eq('status', 'approved').order('created_at', { ascending: false }),
                    syncUserGamification(supabase, user.id)
                ]);

                if (withdrawalsRes.data) setWithdrawals(withdrawalsRes.data);
                if (requestsRes.data) setRequests(requestsRes.data);
                if (uploadsRes.data) setUploads(uploadsRes.data);
                if (gamificationRes) setStats(gamificationRes);

            } catch (err) {
                console.error("Error loading user details:", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [user.id, supabase]);

    const transactions = [
        ...uploads.map(u => ({
            type: 'upload',
            title: u.title,
            amount: 10,
            date: u.created_at,
            status: 'completed',
            utr: undefined as string | undefined
        })),
        ...withdrawals.map(w => ({
            type: 'withdrawal',
            title: 'Withdrawal',
            amount: -w.amount,
            date: w.created_at,
            status: w.status,
            utr: (w as any).transaction_id as string | undefined
        })),
        ...requests.map(r => ({
            type: 'request',
            title: `Request: ${r.song_name}`,
            amount: -10,
            date: r.created_at,
            status: r.status === 'fulfilled' ? 'completed' : 'pending',
            utr: undefined as string | undefined
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm">
                            {user.avatar_url ? (
                                <Image src={user.avatar_url} alt="avatar" fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <UserIcon size={24} />
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 leading-tight">{user.full_name || 'No Name'}</h2>
                            <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200/50 rounded-full transition-colors text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="animate-spin text-indigo-600" size={40} />
                            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Crunching User Data...</p>
                        </div>
                    ) : (
                        <>
                            {/* Profile Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <UserIcon size={12} /> User Info
                                    </h3>
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">UPI ID</span>
                                            <span className="font-bold text-slate-900 font-mono text-xs">{user.upi_id || 'Not Set'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Instagram</span>
                                            <span className="font-bold text-slate-900 text-xs">{user.instagram_handle || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Twitter</span>
                                            <span className="font-bold text-slate-900 text-xs">{user.twitter_handle || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200/50">
                                            <span className="text-slate-500">Member Since</span>
                                            <span className="font-bold text-slate-900 text-xs">{new Date(user.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Wallet size={12} /> Financial Stats
                                    </h3>
                                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-indigo-600 text-xs font-bold uppercase tracking-tight">Current Rep</span>
                                            <span className="text-2xl font-black text-indigo-700">₹{stats?.points || 0}</span>
                                        </div>
                                        <div className="h-px bg-indigo-200/50" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[9px] text-indigo-400 font-bold uppercase">Lifetime</p>
                                                <p className="text-sm font-black text-indigo-600">₹{stats?.lifetimePoints || 0}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] text-indigo-400 font-bold uppercase">Withdrawn</p>
                                                <p className="text-sm font-black text-indigo-600">₹{stats?.totalWithdrawn || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Transaction History */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <History size={12} /> Ledger
                                </h3>
                                <div className="space-y-2">
                                    {transactions.length === 0 ? (
                                        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No transaction history</p>
                                        </div>
                                    ) : transactions.map((t, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                                                    ${t.type === 'upload' ? 'bg-emerald-50 text-emerald-500' :
                                                        t.type === 'withdrawal' ? 'bg-amber-50 text-amber-500' :
                                                            'bg-blue-50 text-blue-500'}`}>
                                                    {t.type === 'upload' ? <CloudUpload size={14} /> :
                                                        t.type === 'withdrawal' ? <Wallet size={14} /> :
                                                            <Star size={14} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-900 truncate">{t.title}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[9px] text-slate-400">{new Date(t.date).toLocaleDateString()}</span>
                                                        {t.utr && (
                                                            <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                                                UTR: {t.utr}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-xs font-black ${t.amount > 0 ? 'text-emerald-500' : 'text-slate-900'}`}>
                                                    {t.amount > 0 ? '+' : ''}{t.amount}
                                                </p>
                                                <span className={`text-[8px] font-black uppercase tracking-tighter
                                                    ${t.status === 'completed' || t.status === 'fulfilled' ? 'text-emerald-500' :
                                                        t.status === 'rejected' ? 'text-red-500' :
                                                            'text-amber-500 animate-pulse'}`}>
                                                    {t.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <Link
                        href={`/admin/ringtones?user_id=${user.id}`}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        <Music size={14} />
                        Ringtones
                    </Link>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
