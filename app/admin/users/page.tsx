'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Profile } from '@/types';
import {
    Search, Shield, ShieldAlert, MoreVertical,
    User as UserIcon, Loader2, Trophy, Star
} from 'lucide-react';
import Image from 'next/image';
import { getLevelTitle } from '@/lib/gamification';

export default function UserManagement() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        // Fetch profiles - 100 limit for now
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (data) setUsers(data as any);
        setLoading(false);
    };

    const filteredUsers = users.filter(u =>
        (u.full_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (u.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (u.id?.toLowerCase() || '').includes(search.toLowerCase())
    );

    const toggleAdmin = async (user: Profile) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        const action = newRole === 'admin' ? 'promote to Admin' : 'revoke Admin rights';

        if (!confirm(`Are you sure you want to ${action} for ${user.full_name || user.email}?`)) return;

        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', user.id);

        if (!error) {
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
        } else {
            alert("Failed to update user role. Check RLS or permissions.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-white">User Management</h1>

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search name, email, ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                    />
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center py-20 text-emerald-500">
                    <Loader2 className="animate-spin" size={32} />
                </div>
            ) : (
                <div className="bg-neutral-900 border border-white/5 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-zinc-400 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="p-4 pl-6">User</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Reputation</th>
                                <th className="p-4">Joined</th>
                                <th className="p-4 text-right pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-zinc-500">No users found.</td>
                                </tr>
                            ) : filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-neutral-800 shrink-0">
                                                {user.avatar_url ? (
                                                    <Image src={user.avatar_url} alt="avatar" fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                                        <UserIcon size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-zinc-200">{user.full_name || 'No Name'}</p>
                                                <p className="text-xs text-zinc-500 font-mono">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider
                        ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-500' : 'bg-zinc-800 text-zinc-400'}`}>
                                            {user.role === 'admin' && <Shield size={12} />}
                                            {user.role || 'USER'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="text-xs">
                                                <span className="text-emerald-400 font-bold block">{user.points || 0} PTS</span>
                                                <span className="text-zinc-500 block">Lvl {user.level || 1}</span>
                                            </div>
                                            <div className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-medium">
                                                {getLevelTitle(user.level || 1)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {/* Assuming created_at exists on profile, if not specific field, maybe we don't display or use a timestamp if available */}
                                        <span className="text-xs text-zinc-500">
                                            {/* {new Date(user.created_at).toLocaleDateString()}  -- Profile might not have created_at in types, let's check or skip */}
                                            -
                                        </span>
                                    </td>
                                    <td className="p-4 text-right pr-6">
                                        <button
                                            onClick={() => toggleAdmin(user)}
                                            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors
                            ${user.role === 'admin'
                                                    ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white'
                                                    : 'bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500 hover:text-white'
                                                }
                        `}
                                        >
                                            {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
