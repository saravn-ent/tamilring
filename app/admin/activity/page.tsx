'use client';

import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2, Download, RefreshCcw } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const ITEMS_PER_PAGE = 20;

type DownloadLog = {
    id: string;
    created_at: string;
    ringtone_id: string;
    user_id: string | null;
    ip_address?: string;
    ringtones: {
        title: string;
        movie_name: string;
    } | null;
};

export default function DownloadActivity() {
    const [logs, setLogs] = useState<DownloadLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const supabase = useMemo(() => createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ), []);

    useEffect(() => {
        fetchLogs();
    }, [page]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const from = (page - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            const { data, count, error } = await supabase
                .from('download_logs')
                .select('*, ringtones ( title, movie_name )', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) {
                console.error('Error fetching download logs:', error);
            } else {
                setLogs(data as any || []);
                setTotalCount(count || 0);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Download Activity</h1>
                    <p className="text-slate-500 text-sm">Monitor recent ringtone downloads.</p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="p-2 border border-slate-200 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                >
                    <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {loading && logs.length === 0 ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs border-b border-slate-200">
                                <tr>
                                    <th className="p-4">Ringtone</th>
                                    <th className="p-4">Downloaded At</th>
                                    <th className="p-4">User / IP</th>
                                    <th className="p-4 text-right">ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-slate-500">
                                            No download activity found.
                                        </td>
                                    </tr>
                                ) : logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            {log.ringtones ? (
                                                <div>
                                                    <p className="font-medium text-slate-900">{log.ringtones.title}</p>
                                                    <p className="text-xs text-slate-500">{log.ringtones.movie_name}</p>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">Unknown Ringtone ({log.ringtone_id})</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-600">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                {log.user_id ? (
                                                    <span className="font-mono text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded w-fit">
                                                        User: {log.user_id.substring(0, 8)}...
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-xs">Guest</span>
                                                )}
                                                {log.ip_address && (
                                                    <span className="text-slate-400 text-[10px] font-mono mt-0.5">{log.ip_address}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right font-mono text-xs text-slate-400">
                                            {log.id.substring(0, 8)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="p-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
                        <span>Showing {logs.length} entries (Page {page})</span>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className="px-3 py-1 rounded bg-slate-50 border border-slate-200 disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <button
                                disabled={logs.length < ITEMS_PER_PAGE}
                                onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1 rounded bg-slate-50 border border-slate-200 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
