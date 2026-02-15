'use client';

import { useEffect, useState, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { LucideIcon, Loader2, Music, Users, Download, Clock, TrendingUp, CircleAlert, RefreshCcw, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import ImageWithFallback from '@/components/ImageWithFallback';
import { getImageUrl } from '@/lib/tmdb';

interface RingtoneSummary {
    id: string;
    title: string;
    created_at: string;
    status: string;
    poster_url: string | null;
    user_id: string;
}

interface StatCardProps {
    title: string;
    value: string | number;
    subValue?: string;
    icon: LucideIcon;
    color: string;
    href?: string;
}

const StatCard = ({ title, value, subValue, icon: Icon, color, href }: StatCardProps) => (
    <Link href={href || '#'} className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-indigo-200 transition-all group relative overflow-hidden shadow-sm hover:shadow-md">
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
            <Icon size={64} />
        </div>
        <div className="relative z-10">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color.replace('text-', 'bg-')}/10 ${color}`}>
                <Icon size={24} />
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
            {subValue && <p className="text-xs text-slate-400 mt-2 font-mono">{subValue}</p>}
        </div>
    </Link>
);

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRingtones: 0,
        pendingRingtones: 0,
        totalUsers: 0,
        totalDownloads: 0,
        todayDownloads: 0,
        weekDownloads: 0,
        pendingWithdrawals: 0,
        totalPaid: 0,
        pendingRequests: 0
    });
    const [recentUploads, setRecentUploads] = useState<RingtoneSummary[]>([]);

    const supabase = useMemo(() => createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ), []);

    useEffect(() => {
        fetchStats();
    }, [supabase]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            // 1. Ringtones Stats
            const { count: totalRings } = await supabase.from('ringtones').select('*', { count: 'exact', head: true });
            const { count: pendingRings } = await supabase.from('ringtones').select('*', { count: 'exact', head: true }).eq('status', 'pending');


            // 2. Users Stats
            const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

            // 3. Withdrawals Stats
            const { count: pendingPayments } = await supabase.from('withdrawals').select('*', { count: 'exact', head: true }).eq('status', 'pending');

            // Requests
            const { count: pendingRequests } = await supabase.from('ringtone_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');

            // 3. Downloads (Sum of downloads column)
            const { data: downloadData } = await supabase.from('ringtones').select('downloads');
            const totalDownloads = downloadData?.reduce((acc, curr) => acc + (curr.downloads || 0), 0) || 0;

            // Analytics (Try/Catch in case table missing)
            let todayDownloads = 0;
            let weekDownloads = 0;
            try {
                const now = new Date();
                const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
                const startOfWeek = new Date(now.setDate(now.getDate() - 7)).toISOString();

                const { count: todayCount, error: tErr } = await supabase
                    .from('download_logs')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', startOfDay);

                if (!tErr) todayDownloads = todayCount || 0;

                const { count: weekCount, error: wErr } = await supabase
                    .from('download_logs')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', startOfWeek);

                if (!wErr) weekDownloads = weekCount || 0;
            } catch (e) {
                console.warn("Analytics table likely missing", e);
            }

            // 5. Total Payouts (Processed)
            const { data: payoutData } = await supabase.from('withdrawals').select('amount').eq('status', 'completed');
            const totalPaidValue = payoutData?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

            // 6. Recent Uploads
            const { data: recents } = await supabase
                .from('ringtones')
                .select('id, title, created_at, status, poster_url, user_id')
                .order('created_at', { ascending: false })
                .limit(5);

            setStats({
                totalRingtones: totalRings || 0,
                pendingRingtones: pendingRings || 0,
                totalUsers: totalUsers || 0,
                totalDownloads: totalDownloads,
                todayDownloads,
                weekDownloads,
                pendingWithdrawals: pendingPayments || 0,
                totalPaid: totalPaidValue,
                pendingRequests: pendingRequests || 0
            });

            if (recents) setRecentUploads(recents);

        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
            </div>
        );
    }
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard Overview</h1>
                    <p className="text-slate-500">Welcome back, Admin. Here&apos;s what&apos;s happening today.</p>
                </div>
                <button
                    onClick={fetchStats}
                    className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm hover:shadow-md"
                    title="Refresh Data"
                >
                    <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Ringtones"
                    value={stats.totalRingtones}
                    icon={Music}
                    color="text-blue-600"
                    href="/admin/ringtones"
                />
                <StatCard
                    title="Downloads Activity"
                    value={stats.totalDownloads || '-'}
                    subValue={`Today: ${stats.todayDownloads} • Week: ${stats.weekDownloads}`}
                    icon={Download}
                    color="text-emerald-600"
                    href="/admin/activity"
                />
                <StatCard
                    title="Requests Pending"
                    value={stats.pendingRequests}
                    icon={MessageSquare}
                    color="text-pink-600"
                    href="/requests"
                />
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={Users}
                    color="text-purple-600"
                    href="/admin/users"
                />
                <StatCard
                    title="Pending Approval"
                    value={stats.pendingRingtones}
                    icon={CircleAlert}
                    color="text-amber-600"
                    href="/admin/ringtones?tab=pending"
                />
                <StatCard
                    title="Pending Payments"
                    value={stats.pendingWithdrawals}
                    icon={Clock}
                    color="text-red-600"
                    href="/admin/withdrawals"
                />
                <StatCard
                    title="Total Paid Out"
                    value={`₹${stats.totalPaid}`}
                    icon={TrendingUp}
                    color="text-emerald-600"
                    href="/admin/withdrawals?tab=completed"
                />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Clock size={18} className="text-slate-400" />
                            Recent Uploads
                        </h3>
                        <Link href="/admin/ringtones" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View All</Link>
                    </div>
                    <div className="space-y-4">
                        {recentUploads.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                    <ImageWithFallback 
                                        src={getImageUrl(item.poster_url)} 
                                        alt={item.title} 
                                        fill 
                                        className="object-cover" 
                                        showIcon 
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-slate-900 truncate">{item.title}</h4>
                                    <p className="text-xs text-slate-500">
                                        by {item.user_id?.substring(0, 8)}... • {new Date(item.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className={`px-2.5 py-1 rounded text-[10px] font-medium uppercase tracking-wider
                                    ${item.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                                        item.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                    {item.status}
                                </div>
                            </div>
                        ))}
                        {recentUploads.length === 0 && (
                            <p className="text-slate-500 text-center py-8">No recent activity.</p>
                        )}
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h3>
                    <div className="space-y-3">
                        <Link href="/requests" className="flex items-center gap-3 p-3 rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors border border-pink-100">
                            <MessageSquare size={20} />
                            <div className="text-left">
                                <span className="block text-sm font-bold">Manage Requests</span>
                                <span className="block text-[10px] opacity-70">View & Fulfill User Requests</span>
                            </div>
                        </Link>
                        <Link href="/admin/ringtones?tab=pending" className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors border border-amber-100">
                            <CircleAlert size={20} />
                            <div className="text-left">
                                <span className="block text-sm font-bold">Review Pending</span>
                                <span className="block text-[10px] opacity-70">Approve or reject uploads</span>
                            </div>
                        </Link>
                        <Link href="/admin/withdrawals" className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors border border-emerald-100">
                            <TrendingUp size={20} />
                            <div className="text-left">
                                <span className="block text-sm font-bold">Manage Payouts</span>
                                <span className="block text-[10px] opacity-70">Process withdrawal requests</span>
                            </div>
                        </Link>

                    </div>
                </div>
            </div>
        </div>
    );
}
