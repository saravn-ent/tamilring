'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Music, Users, Download, Clock, TrendingUp, AlertCircle, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRingtones: 0,
        pendingRingtones: 0,
        totalUsers: 0,
        totalDownloads: 0,
        pendingWithdrawals: 0,
        totalPaid: 0
    });
    const [recentUploads, setRecentUploads] = useState<any[]>([]);

    useEffect(() => {
        fetchStats();
    }, []);

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

            // 3. Downloads (Sum of downloads column)
            const { data: downloadData } = await supabase.from('ringtones').select('downloads');
            const totalDownloads = downloadData?.reduce((acc, curr) => acc + (curr.downloads || 0), 0) || 0;

            // 5. Total Payouts (Processed)
            const { data: payoutData } = await supabase.from('withdrawals').select('amount').eq('status', 'completed');
            const totalPaid = payoutData?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

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
                pendingWithdrawals: pendingPayments || 0,
                totalPaid: totalPaid
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

    const StatCard = ({ title, value, icon: Icon, color, href }: any) => (
        <Link href={href || '#'} className="bg-neutral-900 border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all group relative overflow-hidden">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                <Icon size={64} />
            </div>
            <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color.replace('text-', 'bg-')}/10 ${color}`}>
                    <Icon size={24} />
                </div>
                <h3 className="text-zinc-500 text-sm font-medium mb-1">{title}</h3>
                <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
            </div>
        </Link>
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
                    <p className="text-zinc-400">Welcome back, Admin. Here's what's happening today.</p>
                </div>
                <button
                    onClick={fetchStats}
                    className="p-3 bg-neutral-900 border border-white/5 rounded-xl text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/30 transition-all shadow-sm"
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
                    color="text-blue-500"
                    href="/admin/ringtones"
                />
                <StatCard
                    title="Pending Approval"
                    value={stats.pendingRingtones}
                    icon={AlertCircle}
                    color="text-amber-500"
                    href="/admin/ringtones?tab=pending"
                />
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={Users}
                    color="text-purple-500"
                    href="/admin/users"
                />
                <StatCard
                    title="Total Downloads"
                    value={stats.totalDownloads || '-'}
                    icon={Download}
                    color="text-emerald-500"
                />
                <StatCard
                    title="Pending Payments"
                    value={stats.pendingWithdrawals}
                    icon={Clock}
                    color="text-red-500"
                    href="/admin/withdrawals"
                />
                <StatCard
                    title="Total Paid Out"
                    value={`₹${stats.totalPaid}`}
                    icon={TrendingUp}
                    color="text-emerald-500"
                    href="/admin/withdrawals?tab=completed"
                />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-neutral-900 border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Clock size={18} className="text-zinc-400" />
                            Recent Uploads
                        </h3>
                        <Link href="/admin/ringtones" className="text-xs text-emerald-500 hover:text-emerald-400 font-medium">View All</Link>
                    </div>
                    <div className="space-y-4">
                        {recentUploads.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 
                                    ${item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                        item.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                    {item.status === 'approved' ? <TrendingUp size={18} /> :
                                        item.status === 'rejected' ? <AlertCircle size={18} /> : <Clock size={18} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-zinc-200 truncate">{item.title}</h4>
                                    <p className="text-xs text-zinc-500">
                                        by {item.user_id?.substring(0, 8)}... • {new Date(item.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className={`px-2.5 py-1 rounded text-[10px] font-medium uppercase tracking-wider
                                    ${item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                        item.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                    {item.status}
                                </div>
                            </div>
                        ))}
                        {recentUploads.length === 0 && (
                            <p className="text-zinc-500 text-center py-8">No recent activity.</p>
                        )}
                    </div>
                </div>

                <div className="bg-neutral-900 border border-white/5 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Quick Actions</h3>
                    <div className="space-y-3">
                        <Link href="/admin/ringtones?tab=pending" className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors border border-amber-500/20">
                            <AlertCircle size={20} />
                            <div className="text-left">
                                <span className="block text-sm font-bold">Review Pending</span>
                                <span className="block text-[10px] opacity-70">Approve or reject uploads</span>
                            </div>
                        </Link>
                        <Link href="/admin/withdrawals" className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors border border-emerald-500/20">
                            <TrendingUp size={20} />
                            <div className="text-left">
                                <span className="block text-sm font-bold">Manage Payouts</span>
                                <span className="block text-[10px] opacity-70">Process withdrawal requests</span>
                            </div>
                        </Link>
                        <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors border border-white/5">
                            <RefreshCcw size={20} />
                            <div className="text-left">
                                <span className="block text-sm font-bold">Clear Cache</span>
                                <span className="block text-[10px] opacity-70 font-mono">/api/revalidate</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
