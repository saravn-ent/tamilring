'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Ringtone } from '@/types';
import {
    Search, Filter, MoreVertical, Check, X, Trash2,
    Play, Pause, Edit, ExternalLink, Loader2, Music,
    Calendar, User, Tag, ChevronLeft, ChevronRight,
    CheckSquare, Square, Volume2, Save, RefreshCw, BarChart, HardDrive
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
    approveRingtone, rejectRingtone, deleteRingtone,
    bulkApproveRingtones, bulkDeleteRingtones, updateRingtoneMetadata
} from '@/app/actions/admin';
import { getImageUrl } from '@/lib/tmdb';

// Toast Component
function Toast({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 border ${type === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200' : 'bg-red-950/90 border-red-500/30 text-red-200'
            }`}>
            {type === 'success' ? <Check className="w-5 h-5 shrink-0" /> : <X className="w-5 h-5 shrink-0" />}
            <p className="text-sm font-medium">{message}</p>
        </div>
    );
}

const ITEMS_PER_PAGE = 20;

export default function RingtoneManagement() {
    const [ringtones, setRingtones] = useState<Ringtone[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Audio
    const [playingId, setPlayingId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Selection
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Edit Modal
    const [editingRingtone, setEditingRingtone] = useState<Ringtone | null>(null);
    const [editForm, setEditForm] = useState({
        title: '',
        movie_name: '',
        singers: '',
        music_director: '',
        tags: ''
    });
    const [saving, setSaving] = useState(false);

    // Toast
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Stats
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
    };

    const fetchStats = async () => {
        const { count: pending } = await supabase.from('ringtones').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        const { count: approved } = await supabase.from('ringtones').select('*', { count: 'exact', head: true }).eq('status', 'approved');
        const { count: rejected } = await supabase.from('ringtones').select('*', { count: 'exact', head: true }).eq('status', 'rejected');
        setStats({
            pending: pending || 0,
            approved: approved || 0,
            rejected: rejected || 0,
            total: (pending || 0) + (approved || 0) + (rejected || 0)
        });
    };

    const fetchRingtones = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('ringtones')
                .select('*', { count: 'exact' });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            if (search) {
                query = query.or(`title.ilike.%${search}%,movie_name.ilike.%${search}%`);
            }

            const from = (page - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            const { data, count, error } = await query
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            setRingtones(data as Ringtone[]);
            setTotalCount(count || 0);
        } catch (err: any) {
            console.error(err);
            showToast('Failed to load ringtones', 'error');
        } finally {
            setLoading(false);
        }
    }, [filter, search, page]);

    useEffect(() => {
        fetchRingtones();
        fetchStats();
    }, [fetchRingtones]);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
            }
        };
    }, []);

    const playAudio = (url: string, id: string) => {
        if (playingId === id) {
            audioRef.current?.pause();
            setPlayingId(null);
        } else {
            if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.play();
                setPlayingId(id);
            } else {
                const audio = new Audio(url);
                audio.onended = () => setPlayingId(null);
                audioRef.current = audio;
                audio.play();
                setPlayingId(id);
            }
        }
    };

    // --- Actions ---

    const handleApprove = async (id: string, userId?: string) => {
        const res = await approveRingtone(id, userId);
        if (res.success) {
            showToast('Ringtone approved successfully!');
            fetchRingtones(); // Refresh list
            fetchStats();
        } else {
            showToast(res.error || 'Failed to approve', 'error');
        }
    };

    const handleReject = async (id: string) => {
        const reason = prompt("Enter Rejection Reason (Optional):", "Violation of terms");
        if (reason === null) return;

        const res = await rejectRingtone(id, reason);
        if (res.success) {
            showToast('Ringtone rejected.');
            fetchRingtones();
            fetchStats();
        } else {
            showToast(res.error || 'Failed to reject', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Permanently delete this ringtone? This cannot be undone.')) return;
        const res = await deleteRingtone(id);
        if (res.success) {
            showToast('Ringtone deleted.');
            fetchRingtones();
            fetchStats();
        } else {
            showToast(res.error || 'Failed to delete', 'error');
        }
    };

    // --- Batch Actions ---

    const toggleSelectAll = () => {
        if (selectedIds.size === ringtones.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(ringtones.map(r => r.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const handleBulkApprove = async () => {
        if (!confirm(`Approve ${selectedIds.size} selected ringtones?`)) return;
        setLoading(true);
        const res = await bulkApproveRingtones(Array.from(selectedIds));
        if (res.success) {
            showToast(`Approved ${selectedIds.size} ringtones.`);
            setSelectedIds(new Set());
            fetchRingtones();
            fetchStats();
        } else {
            showToast('Bulk approval failed', 'error');
        }
        setLoading(false);
    };

    const handleBulkDelete = async () => {
        if (!confirm(`DELETE ${selectedIds.size} ringtones? Created files will be removed.`)) return;
        setLoading(true);
        const res = await bulkDeleteRingtones(Array.from(selectedIds));
        if (res.success) {
            showToast(`Deleted ${selectedIds.size} ringtones.`);
            setSelectedIds(new Set());
            fetchRingtones();
            fetchStats();
        } else {
            showToast('Bulk delete failed', 'error');
        }
        setLoading(false);
    };

    // --- Editing ---

    const openEdit = (r: Ringtone) => {
        setEditingRingtone(r);
        setEditForm({
            title: r.title,
            movie_name: r.movie_name || '',
            singers: r.singers || '',
            music_director: r.music_director || '',
            tags: r.tags?.join(', ') || ''
        });
    };

    const saveEdit = async () => {
        if (!editingRingtone) return;
        setSaving(true);
        const tagsArray = editForm.tags.split(',').map(t => t.trim()).filter(Boolean);

        const res = await updateRingtoneMetadata(editingRingtone.id, {
            title: editForm.title,
            movie_name: editForm.movie_name,
            singers: editForm.singers,
            music_director: editForm.music_director,
            tags: tagsArray
        });

        if (res.success) {
            showToast('Ringtone updated.');
            setEditingRingtone(null);
            fetchRingtones();
        } else {
            showToast(res.error || 'Update failed', 'error');
        }
        setSaving(false);
    };

    return (
        <div className="space-y-8 pb-20">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <HardDrive size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Total Uploads</p>
                        <p className="text-2xl font-bold text-white">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <BarChart className="w-24 h-24 text-amber-500" />
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 z-10">
                        <Loader2 size={24} />
                    </div>
                    <div className="z-10">
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Pending Review</p>
                        <p className="text-2xl font-bold text-white">{stats.pending}</p>
                    </div>
                </div>
                <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Check size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Approved</p>
                        <p className="text-2xl font-bold text-white">{stats.approved}</p>
                    </div>
                </div>
                <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                        <X size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Rejected</p>
                        <p className="text-2xl font-bold text-white">{stats.rejected}</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 bg-neutral-900/50 p-4 rounded-2xl border border-white/5">
                {/* Tabs */}
                <div className="flex bg-black/20 p-1 rounded-xl">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => { setFilter(t); setPage(1); setSelectedIds(new Set()) }}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
                                ${filter === t ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}
                            `}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search ringtones..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 focus:bg-black/40 transition-all"
                    />
                </div>
            </div>

            {/* Bulk Actions Header (Visible when Selection > 0) */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-neutral-900 border border-emerald-500/30 shadow-2xl shadow-emerald-900/20 rounded-2xl p-4 flex items-center gap-6 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="flex items-center gap-3 pl-2">
                        <div className="bg-emerald-500 text-black font-bold w-8 h-8 rounded-full flex items-center justify-center text-xs">
                            {selectedIds.size}
                        </div>
                        <span className="text-sm font-medium text-white">Selected</span>
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    <div className="flex items-center gap-3">
                        {filter === 'pending' && (
                            <button onClick={handleBulkApprove} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-sm font-bold transition-colors">
                                <Check size={16} /> Approve All
                            </button>
                        )}
                        <button onClick={handleBulkDelete} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 rounded-lg text-sm font-bold transition-colors border border-red-500/20">
                            <Trash2 size={16} /> Delete
                        </button>
                    </div>
                    <button onClick={() => setSelectedIds(new Set())} className="ml-2 text-zinc-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
            )}

            {/* Main Table */}
            <div className="bg-neutral-900 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <Loader2 className="animate-spin text-emerald-500" size={32} />
                        <p className="text-zinc-500 text-sm">Loading ringtones...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-zinc-400 text-xs uppercase font-bold tracking-wider sticky top-0 backdrop-blur-md z-30">
                                <tr className="border-b border-white/5">
                                    <th className="p-4 w-12 text-center">
                                        <button onClick={toggleSelectAll} className="text-zinc-500 hover:text-white">
                                            {selectedIds.size === ringtones.length && ringtones.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                                        </button>
                                    </th>
                                    <th className="p-4">Ringtone</th>
                                    <th className="p-4">Details</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Tags</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {ringtones.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-zinc-500">
                                            No ringtones found matching your criteria.
                                        </td>
                                    </tr>
                                ) : ringtones.map((r) => (
                                    <tr key={r.id} className={`group transition-colors ${selectedIds.has(r.id) ? 'bg-emerald-500/5' : 'hover:bg-white/[0.02]'}`}>
                                        <td className="p-4 text-center">
                                            <button onClick={() => toggleSelect(r.id)} className={`${selectedIds.has(r.id) ? 'text-emerald-500' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                                                {selectedIds.has(r.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                                            </button>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-neutral-800 shrink-0 border border-white/5 group-hover:border-white/20 transition-colors">
                                                    {r.poster_url ? (
                                                        <Image src={getImageUrl(r.poster_url)} alt={r.title} fill className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                                            <Music size={20} />
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => playAudio(r.audio_url, r.id)}
                                                        className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${playingId === r.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                                    >
                                                        {playingId === r.id ? <Pause className="text-white fill-current" size={20} /> : <Play className="text-white fill-current ml-0.5" size={20} />}
                                                    </button>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-zinc-200 line-clamp-1 max-w-[200px] text-sm group-hover:text-emerald-400 transition-colors">{r.title}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] bg-white/5 text-zinc-400 px-1.5 py-0.5 rounded font-mono">
                                                            {r.id.split('-')[0]}
                                                        </span>
                                                        {r.audio_url_iphone && (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="M4R Available" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                                                    <Film size={12} className="text-zinc-500" />
                                                    <span className="truncate max-w-[150px]">{r.movie_name || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                                                    <User size={12} className="text-zinc-500" />
                                                    <span className="truncate max-w-[150px]">{r.singers || 'Unknown'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border
                                                    ${r.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                        r.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                                    {r.status}
                                                </span>
                                                {r.rejection_reason && (
                                                    <span className="text-[10px] text-red-400 max-w-[120px] leading-tight">{r.rejection_reason}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                                                {r.tags && r.tags.slice(0, 3).map(tag => (
                                                    <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded text-zinc-400">{tag}</span>
                                                ))}
                                                {r.tags && r.tags.length > 3 && <span className="text-[10px] text-zinc-600">+{r.tags.length - 3}</span>}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEdit(r)} className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white" title="Edit">
                                                    <Edit size={16} />
                                                </button>
                                                <Link href={`/ringtone/${r.slug}`} target="_blank" className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white" title="View">
                                                    <ExternalLink size={16} />
                                                </Link>
                                                {r.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => handleApprove(r.id, r.user_id)} className="p-2 hover:bg-emerald-500/20 rounded-lg text-emerald-500" title="Approve">
                                                            <Check size={16} />
                                                        </button>
                                                        <button onClick={() => handleReject(r.id)} className="p-2 hover:bg-amber-500/20 rounded-lg text-amber-500" title="Reject">
                                                            <X size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                <button onClick={() => handleDelete(r.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-500" title="Delete">
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

                {/* Pagination */}
                <div className="border-t border-white/5 p-4 flex items-center justify-between bg-white/[0.02]">
                    <div className="text-xs text-zinc-500">
                        Showing <span className="text-white font-bold">{Math.min(totalCount, (page - 1) * ITEMS_PER_PAGE + 1)}</span> to <span className="text-white font-bold">{Math.min(totalCount, page * ITEMS_PER_PAGE)}</span> of <span className="text-white font-bold">{totalCount}</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-2 rounded-lg bg-white/5 border border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            disabled={page * ITEMS_PER_PAGE >= totalCount}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 rounded-lg bg-white/5 border border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingRingtone && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">Edit Ringtone Details</h3>
                            <button onClick={() => setEditingRingtone(null)} className="text-zinc-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1.5">Title</label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 uppercase block mb-1.5">Movie / Album</label>
                                    <input
                                        type="text"
                                        value={editForm.movie_name}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, movie_name: e.target.value }))}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 uppercase block mb-1.5">Music Director</label>
                                    <input
                                        type="text"
                                        value={editForm.music_director}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, music_director: e.target.value }))}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1.5">Singers</label>
                                <input
                                    type="text"
                                    value={editForm.singers}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, singers: e.target.value }))}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1.5">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    value={editForm.tags}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                                    placeholder="Love, Melody, BGM..."
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none text-sm"
                                />
                                <p className="text-[10px] text-zinc-600 mt-1">Used for search and recommendations.</p>
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-end gap-3 rounded-b-2xl">
                            <button
                                onClick={() => setEditingRingtone(null)}
                                className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveEdit}
                                disabled={saving}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 text-black hover:bg-emerald-400 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                            >
                                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
