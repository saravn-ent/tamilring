'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Ringtone } from '@/types';
import {
    Search, Filter, MoreVertical, Check, X, Trash2,
    Play, Pause, Edit, ExternalLink, Loader2
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function RingtoneManagement() {
    const [ringtones, setRingtones] = useState<Ringtone[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [search, setSearch] = useState('');
    const [playingId, setPlayingId] = useState<string | null>(null);

    useEffect(() => {
        fetchRingtones();
    }, []);

    const fetchRingtones = async () => {
        setLoading(true);
        let query = supabase.from('ringtones').select('*').order('created_at', { ascending: false });

        if (filter !== 'all') {
            query = query.eq('status', filter);
        }

        // Note: Search logic is better done client-side for small datasets or via separate query if large.
        // We'll fetch mostly latest 100 for now.
        query = query.limit(100);

        const { data, error } = await query;
        if (data) setRingtones(data as any);
        setLoading(false);
    };

    // Re-fetch when filter changes
    useEffect(() => {
        fetchRingtones();
    }, [filter]);

    const filteredRingtones = ringtones.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.movie_name.toLowerCase().includes(search.toLowerCase()) ||
        r.user_id?.toLowerCase().includes(search.toLowerCase())
    );

    const handleApprove = async (id: string, userId?: string) => {
        if (!confirm('Approve this ringtone?')) return;
        const { error } = await supabase.from('ringtones').update({ status: 'approved' }).eq('id', id);
        if (!error) {
            setRingtones(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
            // Gamification trigger could be here too
            if (userId) {
                const { awardPoints, checkUploadBadges, POINTS_PER_UPLOAD } = await import('@/lib/gamification');
                await awardPoints(supabase, userId, POINTS_PER_UPLOAD);
                await checkUploadBadges(supabase, userId);
            }
        }
    };

    const handleReject = async (id: string) => {
        const reason = prompt("Rejection Reason:");
        if (!reason) return;
        const { error } = await supabase.from('ringtones').update({ status: 'rejected', rejection_reason: reason }).eq('id', id);
        if (!error) {
            setRingtones(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to PERMANENTLY delete this ringtone? This action cannot be undone.')) return;
        const { error } = await supabase.from('ringtones').delete().eq('id', id);
        if (!error) {
            setRingtones(prev => prev.filter(r => r.id !== id));
        } else {
            alert("Failed to delete. Check permissions.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-white">Ringtone Management</h1>

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search title, movie, user..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-white/10 scrollbar-hide">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-6 py-3 text-sm font-medium capitalize border-b-2 transition-colors whitespace-nowrap
              ${filter === tab ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}
            `}
                    >
                        {tab}
                    </button>
                ))}
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
                                <th className="p-4 pl-6">Ringtone</th>
                                <th className="p-4">Movie / Artist</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Stats</th>
                                <th className="p-4 text-right pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredRingtones.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-zinc-500">No ringtones found.</td>
                                </tr>
                            ) : filteredRingtones.map((ringtone) => (
                                <tr key={ringtone.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-4 pl-6">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-800 shrink-0">
                                                <Image src={ringtone.poster_url || '/placeholder.png'} alt="poster" fill className="object-cover" />
                                                <button
                                                    onClick={() => {
                                                        const audio = document.getElementById(`audio-${ringtone.id}`) as HTMLAudioElement;
                                                        if (playingId === ringtone.id) {
                                                            audio.pause();
                                                            setPlayingId(null);
                                                        } else {
                                                            // stop others
                                                            document.querySelectorAll('audio').forEach(a => a.pause());
                                                            audio.play();
                                                            setPlayingId(ringtone.id);
                                                        }
                                                    }}
                                                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    {playingId === ringtone.id ? <Pause size={16} className="text-white" /> : <Play size={16} className="text-white" />}
                                                </button>
                                                <audio id={`audio-${ringtone.id}`} src={ringtone.audio_url} onEnded={() => setPlayingId(null)} className="hidden" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-zinc-200 line-clamp-1 max-w-[200px]">{ringtone.title}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`w-2 h-2 rounded-full 
                                    ${ringtone.audio_url_iphone ? 'bg-blue-500' : 'bg-zinc-700'}`} title={ringtone.audio_url_iphone ? 'iPhone Ready' : 'No M4R'} />
                                                    <span className="text-[10px] text-zinc-500 font-mono">{ringtone.id.split('-')[0]}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-sm text-zinc-300">{ringtone.movie_name}</p>
                                        <p className="text-xs text-zinc-500">{ringtone.music_director || 'Unknown'}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                        ${ringtone.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                                ringtone.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                            {ringtone.status}
                                        </span>
                                        {ringtone.rejection_reason && <p className="text-[10px] text-red-400 mt-1 max-w-[150px] truncate" title={ringtone.rejection_reason}>{ringtone.rejection_reason}</p>}
                                    </td>
                                    <td className="p-4">
                                        <div className="text-xs text-zinc-400">
                                            <span className="text-zinc-200 font-bold">{ringtone.likes || 0}</span> Likes
                                            <br />
                                            <span className="text-zinc-200 font-bold">{ringtone.downloads || 0}</span> DLCs
                                        </div>
                                    </td>
                                    <td className="p-4 text-right pr-6">
                                        <div className="flex items-center justify-end gap-2">
                                            {ringtone.status === 'pending' && (
                                                <>
                                                    <button onClick={() => handleApprove(ringtone.id, ringtone.user_id)} title="Approve" className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors">
                                                        <Check size={16} />
                                                    </button>
                                                    <button onClick={() => handleReject(ringtone.id)} title="Reject" className="p-2 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-colors">
                                                        <X size={16} />
                                                    </button>
                                                </>
                                            )}
                                            <Link href={`/ringtone/${ringtone.slug}`} target="_blank" className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
                                                <ExternalLink size={16} />
                                            </Link>
                                            <button onClick={() => handleDelete(ringtone.id)} title="Delete" className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
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
