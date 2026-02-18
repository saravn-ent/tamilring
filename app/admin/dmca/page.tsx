'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { DmcaRequest } from '@/types';
import { 
    Check, X, Shield, 
    Loader2, ChevronLeft, ChevronRight,
    Mail, Phone, FileText, AlertTriangle
} from 'lucide-react';
import { approveDmcaTakedown, rejectDmcaRequest } from '@/app/actions/dmca';
import { format } from 'date-fns';

function Toast({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 border ${
            type === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200' : 'bg-red-950/90 border-red-500/30 text-red-200'
        }`}>
            {type === 'success' ? <Check className="w-5 h-5 shrink-0" /> : <X className="w-5 h-5 shrink-0" />}
            <p className="text-sm font-medium">{message}</p>
        </div>
    );
}

const ITEMS_PER_PAGE = 20;

export default function DmcaManagement() {
    const [requests, setRequests] = useState<DmcaRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const supabase = useMemo(() => createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ), []);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
    };

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('dmca_requests')
                .select('*', { count: 'exact' });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const from = (page - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            const { data, count, error } = await query
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            setRequests(data as DmcaRequest[]);
            setTotalCount(count || 0);
        } catch (err) {
            console.error(err);
            showToast('Failed to load requests', 'error');
        } finally {
            setLoading(false);
        }
    }, [filter, page, supabase]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleApprove = async (id: string) => {
        if (!confirm('Approve this DMCA request? This will mark it as resolved and may delete content if logic is enabled.')) return;
        
        try {
            const res = await approveDmcaTakedown(id);
            if (res.success) {
                showToast(`Request Approved. ${res.deletedCount ? res.deletedCount + ' items removed.' : ''}`);
                fetchRequests();
            } else {
                showToast(res.error || 'Failed to approve', 'error');
            }
        } catch (e) {
            console.error(e);
            showToast('An error occurred', 'error');
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Reject this DMCA request?')) return;
        
        try {
            const res = await rejectDmcaRequest(id);
            if (res.success) {
                showToast('Request Rejected');
                fetchRequests();
            } else {
                showToast(res.error || 'Failed to reject', 'error');
            }
        } catch (e) {
            console.error(e);
            showToast('An error occurred', 'error');
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                 <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <Shield className="text-indigo-600" />
                    DMCA Requests
                 </h1>

                <div className="flex bg-slate-100 p-1 rounded-xl">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => { setFilter(t); setPage(1); }}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
                                ${filter === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'}
                            `}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                 <div className="flex flex-col items-center justify-center h-64 gap-4 bg-white border border-slate-200 rounded-2xl">
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                    <p className="text-slate-500 text-sm">Loading requests...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {requests.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-200">
                            No DMCA requests found.
                        </div>
                    ) : requests.map((req) => (
                        <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Left: Meta & Status */}
                                <div className="md:w-1/4 space-y-4 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider border
                                            ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                              req.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' : 
                                              'bg-amber-50 text-amber-600 border-amber-200'}`}>
                                            {req.status}
                                        </span>
                                        <span className="text-xs text-slate-400 font-mono">
                                            {format(new Date(req.created_at), 'MMM d, yyyy')}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-slate-700">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                                <Shield size={14} />
                                            </div>
                                            <span className="font-bold truncate" title={req.name}>{req.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                                <Mail size={14} />
                                            </div>
                                            <a href={`mailto:${req.email}`} className="hover:text-indigo-600 truncate underline">{req.email}</a>
                                        </div>
                                        {req.phone && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                                    <Phone size={14} />
                                                </div>
                                                <span>{req.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {req.good_faith && (
                                            <span className="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100 flex items-center gap-1">
                                                <Check size={10} /> Good Faith
                                            </span>
                                        )}
                                        {req.accurate && (
                                            <span className="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100 flex items-center gap-1">
                                                <Check size={10} /> Perjury Stmt
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Content details */}
                                <div className="flex-1 space-y-4">
                                     <div>
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <FileText size={12} /> Claimed Work
                                        </h3>
                                        <div className="bg-slate-50 p-3 rounded-xl text-sm text-slate-700 leading-relaxed border border-slate-100">
                                            {req.work_description}
                                        </div>
                                     </div>

                                     <div>
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <AlertTriangle size={12} /> Infringing URLs
                                        </h3>
                                        <div className="bg-slate-50 p-3 rounded-xl text-xs font-mono text-slate-600 border border-slate-100 break-all whitespace-pre-wrap max-h-32 overflow-y-auto">
                                            {req.infringing_urls}
                                        </div>
                                     </div>
                                     
                                     {req.admin_notes && (
                                         <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                                             <h4 className="text-xs font-bold text-yellow-800 mb-1">Admin Notes</h4>
                                             <p className="text-sm text-yellow-700">{req.admin_notes}</p>
                                         </div>
                                     )}

                                     {req.status === 'pending' && (
                                         <div className="flex gap-3 pt-2">
                                             <button 
                                                onClick={() => handleApprove(req.id)}
                                                className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2"
                                             >
                                                 <Check size={16} /> Approve Takedown
                                             </button>
                                             <button 
                                                onClick={() => handleReject(req.id)}
                                                className="px-4 py-2 bg-white text-slate-600 text-sm font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2"
                                             >
                                                 <X size={16} /> Reject Request
                                             </button>
                                         </div>
                                     )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            <div className="p-4 flex items-center justify-between bg-white border border-slate-200 rounded-2xl md:mt-0 shadow-sm">
                <div className="text-xs text-slate-500">
                    Showing <span className="text-slate-900 font-bold">{Math.min(totalCount, (page - 1) * ITEMS_PER_PAGE + 1)}</span> to <span className="text-slate-900 font-bold">{Math.min(totalCount, page * ITEMS_PER_PAGE)}</span> of <span className="text-slate-900 font-bold">{totalCount}</span>
                </div>
                <div className="flex gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        disabled={page * ITEMS_PER_PAGE >= totalCount}
                        onClick={() => setPage(p => p + 1)}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
