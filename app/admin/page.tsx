'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Image from 'next/image';
import { Loader2, Check, X, LogOut, ShieldAlert, BadgeCheck } from 'lucide-react';
import { Ringtone } from '@/types';
import { useRouter } from 'next/navigation';
import LoginButton from '@/components/LoginButton';

export default function AdminDashboard() {
    const [ringtones, setRingtones] = useState<Ringtone[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                console.error("Auth check failed:", authError);
                setLoading(false);
                return;
            }

            setUser(user);

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profileError) {
                console.error("Profile check failed:", profileError);
                // If error accessing profile, likely row doesn't exist or RLS blocked -> treat as not admin
                setLoading(false);
                return;
            }

            if (profile?.role === 'admin') {
                setIsAdmin(true);
                await fetchPendingRingtones();
            } else {
                setLoading(false);
            }
        } catch (e) {
            console.error("Unexpected error in checkAdmin:", e);
            setLoading(false);
        }
    };

    const fetchPendingRingtones = async () => {
        try {
            const { data, error } = await supabase
                .from('ringtones')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                setRingtones(data as any);
            }
        } catch (e) {
            console.error("Error fetching ringtones:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (ringtone: Ringtone) => {
        const { error } = await supabase
            .from('ringtones')
            .update({ status: 'approved' })
            .eq('id', ringtone.id);

        if (!error) {
            setRingtones(prev => prev.filter(r => r.id !== ringtone.id));

            // Gamification Logic
            if (ringtone.user_id) {
                // Dynamically import to avoid server/client issues if any, though it's client code
                const { awardPoints, checkUploadBadges, POINTS_PER_UPLOAD } = await import('@/lib/gamification');
                await awardPoints(supabase, ringtone.user_id, POINTS_PER_UPLOAD);
                await checkUploadBadges(supabase, ringtone.user_id);
            }
        } else {
            alert('Error approving ringtone');
        }
    };

    const handleReject = async (id: string) => {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;

        const { error } = await supabase
            .from('ringtones')
            .update({ status: 'rejected', rejection_reason: reason })
            .eq('id', id);

        if (!error) {
            setRingtones(prev => prev.filter(r => r.id !== id));
        } else {
            alert('Error rejecting ringtone');
        }
    };

    if (loading) {
        return <div className="h-screen flex items-center justify-center text-zinc-500"><Loader2 className="animate-spin mr-2" /> Checking permissions...</div>;
    }

    if (!isAdmin) {
        return (
            <div className="h-screen flex flex-col items-center justify-center p-8 text-center">
                <ShieldAlert size={48} className="text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-zinc-100 mb-2">Access Denied</h1>
                <p className="text-zinc-400 mb-8">You do not have permission to view this page.</p>

                <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800 mb-8 max-w-lg text-left">
                    <p className="text-xs text-zinc-500 uppercase font-bold mb-2">Debug Info</p>
                    {user ? (
                        <>
                            <p className="text-sm text-zinc-400 font-mono mb-1">User ID: <span className="text-zinc-100">{user.id}</span></p>
                            <p className="text-sm text-zinc-400 font-mono mb-4">Email: <span className="text-zinc-100">{user.email}</span></p>

                            <p className="text-xs text-zinc-500 uppercase font-bold mb-2">How to Fix</p>
                            <p className="text-xs text-zinc-400 mb-2">Run this SQL in your Supabase SQL Editor:</p>
                            <code className="block bg-black p-2 rounded text-xs text-green-400 font-mono break-all selection:bg-zinc-700">
                                UPDATE profiles SET role = 'admin' WHERE id = '{user.id}';
                            </code>
                        </>
                    ) : (
                        <div className="text-center">
                            <p className="text-zinc-400 mb-2">User details not valid.</p>
                            <p className="text-xs text-zinc-500 mb-4">Please try signing out and signing back in.</p>
                        </div>
                    )}
                </div>

                <LoginButton />
                <button onClick={() => router.push('/')} className="mt-4 text-zinc-500 hover:text-zinc-300">Back to Home</button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 min-h-screen pb-24">
            <div className="flex items-center justify-between mb-8 pt-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
                        <BadgeCheck className="text-emerald-500" />
                        Admin Dashboard
                    </h1>
                    <p className="text-zinc-400 text-sm">Review pending uploads ({ringtones.length})</p>
                </div>
                <button
                    onClick={() => { supabase.auth.signOut(); router.push('/'); }}
                    className="text-xs text-red-500 hover:text-red-400 bg-red-500/10 px-3 py-1.5 rounded-full"
                >
                    Sign Out
                </button>
            </div>

            {ringtones.length === 0 ? (
                <div className="text-center py-20 bg-neutral-900/50 rounded-xl border border-dashed border-neutral-800">
                    <p className="text-zinc-500">No pending ringtones to review.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {ringtones.map(ringtone => (
                        <div key={ringtone.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4">
                            {/* Media Preview */}
                            <div className="w-full sm:w-48 shrink-0 space-y-2">
                                <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-800">
                                    <Image
                                        src={ringtone.poster_url || '/placeholder.png'}
                                        alt={ringtone.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <audio controls src={ringtone.audio_url} className="w-full h-8" />
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg text-zinc-100">{ringtone.title}</h3>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-zinc-400 mt-2">
                                    <p><span className="text-zinc-500">Movie:</span> {ringtone.movie_name} ({ringtone.movie_year})</p>
                                    <p><span className="text-zinc-500">Singers:</span> {ringtone.singers}</p>
                                    <p><span className="text-zinc-500">Music:</span> {ringtone.music_director}</p>
                                    <p><span className="text-zinc-500">Director:</span> {ringtone.movie_director}</p>
                                    <p className="col-span-2 truncate"><span className="text-zinc-500">Tags:</span> {ringtone.tags?.join(', ')}</p>
                                    <p className="col-span-2 text-xs font-mono text-zinc-600 mt-1">ID: {ringtone.id}</p>
                                    <p className="col-span-2 text-xs font-mono text-zinc-600">User: {ringtone.user_id}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex sm:flex-col gap-2 justify-center border-t sm:border-t-0 sm:border-l border-neutral-800 pt-4 sm:pt-0 sm:pl-4 mt-2 sm:mt-0">
                                <button
                                    onClick={() => handleApprove(ringtone)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black border border-emerald-500/20 rounded-lg px-4 py-2 font-medium transition-all"
                                >
                                    <Check size={18} /> Approve
                                </button>
                                <button
                                    onClick={() => handleReject(ringtone.id)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-lg px-4 py-2 font-medium transition-all"
                                >
                                    <X size={18} /> Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
