'use client';

import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Profile } from '@/types';
import {
    Search, Shield,
    User as UserIcon, Loader2, Music
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getLevelTitle } from '@/lib/gamification';
import { toggleUserRole } from '@/app/actions/admin';

export default function UserManagement() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

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
                                            <Link href={`/admin/ringtones?user_id=${user.id}`} className="font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                                                {user.full_name || 'No Name'}
                                            </Link>
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

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-xs text-slate-600">
                                        Joined: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                    </span>
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
                                                    <Link href={`/admin/ringtones?user_id=${user.id}`} className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                                                        {user.full_name || 'No Name'}
                                                    </Link>
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
        </div>
    );
}
