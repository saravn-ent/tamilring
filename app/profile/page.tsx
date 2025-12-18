'use client';

import { useEffect, useState, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User, Heart, Music, Trash2, X, LayoutDashboard, UploadCloud, Star } from 'lucide-react';
import UploadForm from '@/components/UploadForm';
import FavoritesList from '@/components/FavoritesList';
import LoginButton from '@/components/LoginButton';
import PersonalCollections from '@/components/PersonalCollections';
import AvatarRank from '@/components/AvatarRank';
import { getLevelTitle, syncUserGamification, POINTS_PER_UPLOAD } from '@/lib/gamification';
import { Ringtone } from '@/types';
import { handleWithdrawal } from '@/app/actions';

// Simple timeout helper
const withTimeout = (promise: any, ms: number = 5000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms))
  ]);
};

export default function ProfilePage() {
  const router = useRouter();

  // Stable Supabase Client
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [uploads, setUploads] = useState<Ringtone[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'uploads' | 'upload'>('overview');

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [upiId, setUpiId] = useState('');
  const [btcAddress, setBtcAddress] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        // 1. Get User
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
          setUser(null);
          setLoading(false);
          return;
        }

        if (!mounted) return;
        setUser(user);

        if (!user) {
          setLoading(false);
          return;
        }

        // 2. Load fetching in parallel
        const fetchProfile = withTimeout(supabase.from('profiles').select('*').eq('id', user.id).single())
          .catch((e: any) => ({ error: e }));

        const fetchUploads = withTimeout(supabase.from('ringtones').select('*').eq('user_id', user.id).order('created_at', { ascending: false }))
          .catch((e: any) => ({ error: e }));

        const fetchBadges = withTimeout(supabase.from('user_badges').select('*, badge:badges(*)').eq('user_id', user.id))
          .catch((e: any) => ({ error: e }));

        const fetchWithdrawals = withTimeout(supabase.from('withdrawals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }))
          .catch((e: any) => ({ error: e }));

        const [profileRes, uploadsRes, badgesRes, withdrawalsRes] = await Promise.all([
          fetchProfile, fetchUploads, fetchBadges, fetchWithdrawals
        ]);

        if (!mounted) return;

        // Handle Uploads & Recalculate Points
        let currentPoints = 0;
        let currentLevel = 1;

        if (uploadsRes.data) {
          setUploads(uploadsRes.data as any[]);
          const approvedCount = (uploadsRes.data as any[]).filter(u => u.status === 'approved').length;
          currentPoints = approvedCount * POINTS_PER_UPLOAD;
          currentLevel = Math.floor(currentPoints / 500) + 1;
        }

        if (badgesRes.data) setUserBadges(badgesRes.data);
        if (withdrawalsRes.data) setWithdrawals(withdrawalsRes.data);

        // Handle Profile
        if (profileRes.data) {
          const profileData = {
            ...profileRes.data,
            points: currentPoints,
            level: currentLevel
          };
          setProfile(profileData);
          setFullName(profileRes.data.full_name || '');
          setBio(profileRes.data.bio || '');
          setWebsite(profileRes.data.website_url || '');
          setInstagram(profileRes.data.instagram_handle || '');
          setTwitter(profileRes.data.twitter_handle || '');
          setUpiId(profileRes.data.upi_id || '');
          setBtcAddress(profileRes.data.btc_address || '');
        }

        // Async Gamification Sync
        syncUserGamification(supabase, user.id)
          .then(synced => {
            if (synced && mounted) setProfile((prev: any) => ({ ...prev, ...synced }));
          })
          .catch(console.error);

      } catch (err: any) {
        console.error('Fatal load error:', err);
        if (mounted) setError(err.message || 'Failed to load profile');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    return () => { mounted = false; };
  }, [supabase]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (e) {
      window.location.href = '/';
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const updates = {
        id: user.id,
        full_name: fullName,
        bio,
        website_url: website,
        instagram_handle: instagram,
        twitter_handle: twitter,
        upi_id: upiId,
        btc_address: btcAddress,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
      setProfile({ ...profile, ...updates });
      setIsEditing(false);
    } catch (error: any) {
      alert(`Error updating profile: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this ringtone?')) return;
    try {
      const { error } = await supabase.from('ringtones').delete().eq('id', id);
      if (error) throw error;
      setUploads(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      alert('Error deleting ringtone');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-500 font-mono text-sm">Loading profile data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 p-4 text-center">
        <p className="text-red-500 font-bold">Something went wrong</p>
        <p className="text-zinc-500 text-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-emerald-500 text-black font-bold rounded-lg mr-2">Try Again</button>
        <button onClick={handleSignOut} className="text-zinc-500 hover:text-zinc-300 text-sm">Sign Out</button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto p-4 flex flex-col min-h-[calc(100vh-120px)] items-center justify-center text-center space-y-6">
        <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center text-zinc-500 shadow-xl shadow-black/20">
          <User size={48} />
        </div>
        <h1 className="text-2xl font-bold text-zinc-100">Guest User</h1>
        <p className="text-zinc-400 max-w-xs">Sign in to view your profile and contributions.</p>
        <LoginButton />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col pb-24">
      {/* Header */}
      <header className="flex flex-col items-center pt-4 pb-6 px-4 relative">
        <div className="mb-4">
          <AvatarRank
            image={profile?.avatar_url || user.user_metadata?.avatar_url}
            point={profile?.points || 0}
            level={profile?.level || 1}
            size="lg"
          />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">
          {profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Ringtone User'}
        </h1>
        <p className="text-xs text-zinc-600 mb-4 font-mono">{user.email}</p>
        {profile?.bio && <p className="text-zinc-400 text-sm max-w-sm text-center mb-4 leading-relaxeditalic italic">"{profile.bio}"</p>}

        {/* Stats */}
        <div className="flex items-center gap-6 mb-6 text-sm">
          <div className="flex flex-col items-center">
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-white text-xl">{uploads?.filter(u => u.status === 'approved').length || 0}</span>
              {uploads?.some(u => u.status === 'pending') && (
                <span className="text-zinc-500 text-[10px]">/ {uploads?.length}</span>
              )}
            </div>
            <span className="text-zinc-500 font-medium text-[10px] uppercase tracking-wider">Ringtones</span>
          </div>
          <div className="w-px h-8 bg-neutral-800" />
          <div className="flex flex-col items-center">
            <span className="font-bold text-emerald-500 text-xl">{profile?.points || 0}</span>
            <span className="text-zinc-500 font-medium text-[10px] uppercase tracking-wider">Rep Points</span>
          </div>
          <div className="w-px h-8 bg-neutral-800" />
          <div className="flex flex-col items-center">
            <span className="font-bold text-amber-500 text-xl">{getLevelTitle(profile?.level || 1)}</span>
            <span className="text-zinc-500 font-medium text-[10px] uppercase tracking-wider">Level</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 bg-neutral-800 text-zinc-200 text-xs font-black rounded-full hover:bg-neutral-700 transition-all border border-neutral-700 uppercase tracking-widest"
          >
            Edit Profile
          </button>
          <button
            onClick={handleSignOut}
            className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
          >
            <X size={18} />
          </button>
        </div>

        {/* Edit Profile Modal */}
        {isEditing && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-3xl relative overflow-hidden">
              <button onClick={() => setIsEditing(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>

              <h2 className="text-xl font-black text-white mb-1 uppercase tracking-tight">Edit Profile</h2>
              <p className="text-[10px] font-bold text-emerald-500 mb-6 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 flex items-center gap-2">
                <Star size={12} fill="currentColor" /> EARN ₹15 PER APPROVED UPLOAD!
              </p>

              <form onSubmit={handleUpdateProfile} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block ml-1">Full Name</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-700" placeholder="Display Name" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block ml-1">Bio</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all resize-none placeholder:text-zinc-700" placeholder="Tell the world about yourself..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block ml-1">Instagram</label>
                      <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all font-mono text-[11px]" placeholder="@handle" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block ml-1">X / Twitter</label>
                      <input type="text" value={twitter} onChange={e => setTwitter(e.target.value)} className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all font-mono text-[11px]" placeholder="@handle" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-4">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Withdrawal Info</p>
                  <div>
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block ml-1">UPI ID (For Payouts)</label>
                    <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all font-mono text-[11px] text-emerald-500 placeholder:text-zinc-800" placeholder="yourname@upi" />
                  </div>
                </div>

                <button type="submit" disabled={saving} className="w-full py-4 bg-emerald-500 text-black font-black rounded-2xl hover:bg-emerald-400 transition-all disabled:opacity-50 shadow-xl shadow-emerald-500/20 uppercase tracking-widest text-[11px] mt-4">
                  {saving ? 'Syncing...' : 'Update Explorer Profile'}
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Tabs */}
      <div className="sticky top-14 z-20 bg-black/80 backdrop-blur-md border-b border-neutral-800 mb-6">
        <div className="flex w-full px-2">
          {['overview', 'uploads', 'upload'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all flex items-center justify-center gap-2 ${activeTab === tab ? 'border-emerald-500 text-emerald-500 bg-emerald-500/5' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            >
              {tab === 'overview' && <LayoutDashboard size={14} />}
              {tab === 'uploads' && <Music size={14} />}
              {tab === 'upload' && <UploadCloud size={14} />}
              <span>{tab === 'uploads' ? 'My Rings' : tab}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 px-4">
        {activeTab === 'overview' && (
          <div className="animate-in slide-in-from-left-4 fade-in duration-300 space-y-8">
            {/* Wallet Section */}
            <section className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 relative overflow-hidden group shadow-2xl">
              <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Star size={120} />
              </div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tighter">
                      <Star className="text-amber-500" size={20} fill="currentColor" />
                      Earnings
                    </h2>
                    <p className="text-[10px] font-bold text-zinc-500 tracking-wider">1 REP = ₹1 (UPI Payout)</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-emerald-500 tabular-nums">₹{profile?.points || 0}</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Next Payout Goal</span>
                      <span className="text-[10px] font-black text-white">
                        {profile?.total_withdrawn_count === 0 ? '₹15' : '₹1000'}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        style={{ width: `${Math.min(100, ((profile?.points || 0) / (profile?.total_withdrawn_count === 0 ? 15 : 1000)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      disabled={saving || (profile?.points || 0) < (profile?.total_withdrawn_count === 0 ? 15 : 1000) || !upiId}
                      onClick={async () => {
                        setSaving(true);
                        const res = await handleWithdrawal(user.id, profile.points, upiId);
                        if (res.success) {
                          alert(`Success! ₹${profile.points} requested to ${upiId}`);
                          window.location.reload();
                        } else {
                          alert(res.error || 'Withdrawal failed');
                        }
                        setSaving(false);
                      }}
                      className="w-full py-4 bg-emerald-500 text-black font-black rounded-2xl hover:bg-emerald-400 disabled:opacity-30 disabled:grayscale transition-all shadow-xl shadow-emerald-500/20 uppercase tracking-widest text-[11px]"
                    >
                      Withdraw Rep as Rupees
                    </button>

                    {!upiId && (
                      <p className="text-[10px] text-center text-amber-500/80 font-bold bg-amber-500/5 py-2 rounded-lg border border-amber-500/10">
                        ⚠️ ADD UPI ID IN PROFILE TO WITHDRAW
                      </p>
                    )}
                  </div>

                  {/* History */}
                  {withdrawals.length > 0 && (
                    <div className="pt-6 border-t border-white/5">
                      <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Payout Audit Log</h3>
                      <div className="space-y-2">
                        {withdrawals.map((w: any) => (
                          <div key={w.id} className="flex items-center justify-between text-[11px] bg-black/40 rounded-xl p-3 border border-white/5">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-zinc-200 font-black">₹{w.amount}</span>
                              <span className="text-zinc-600 text-[9px] tabular-nums font-medium">{new Date(w.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className={`px-2 py-1 rounded-md font-black uppercase tracking-tighter text-[9px] border ${w.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                w.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                  'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }`}>
                              {w.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <PersonalCollections />

            <section className="pb-10">
              <h2 className="text-lg font-black text-white mb-6 flex items-center gap-3 uppercase tracking-tighter">
                <Heart size={20} className="text-emerald-500" fill="currentColor" />
                Hearted Classics
              </h2>
              <FavoritesList />
            </section>
          </div>
        )}

        {activeTab === 'uploads' && (
          <div className="animate-in slide-in-from-right-4 fade-in duration-300 space-y-4 pb-20">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-black text-white uppercase tracking-tighter">My Contributions</h2>
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{uploads.length} items</span>
            </div>

            {uploads.length === 0 ? (
              <div className="text-center py-16 bg-neutral-900/40 rounded-3xl border border-dashed border-neutral-800">
                <Music size={40} className="mx-auto text-zinc-800 mb-4" />
                <p className="text-zinc-500 font-bold text-sm">Nothing posted yet</p>
                <button onClick={() => setActiveTab('upload')} className="text-emerald-500 text-[10px] font-black uppercase mt-2 tracking-widest hover:underline">Start Contributing</button>
              </div>
            ) : (
              <div className="space-y-3">
                {uploads.map(ringtone => (
                  <div key={ringtone.id} className="flex items-center gap-4 bg-neutral-900/60 border border-neutral-800/50 p-3 rounded-2xl hover:border-emerald-500/30 transition-all group shadow-sm">
                    <div className="w-14 h-14 rounded-xl bg-neutral-800 relative overflow-hidden shrink-0 shadow-inner">
                      {ringtone.poster_url ? (
                        <Image src={ringtone.poster_url} alt={ringtone.title} fill className="object-cover" sizes="56px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700"><Music size={18} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-zinc-100 truncate">{ringtone.title}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border ${ringtone.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            ringtone.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                          {ringtone.status}
                        </span>
                      </div>
                    </div>
                    <button onClick={(e) => handleDelete(ringtone.id, e)} className="p-2 text-zinc-700 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="animate-in zoom-in-95 fade-in duration-300 pb-20">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden">
              <UploadForm userId={user.id} onComplete={() => {
                setActiveTab('uploads');
                window.location.reload();
              }} />
            </div>
          </div>
        )}
      </main>

      <div className="pt-10 flex flex-col items-center pb-20 opacity-20">
        <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em]">Member since {new Date(user.created_at).getFullYear()}</p>
        <div className="w-12 h-0.5 bg-emerald-500 mt-2 rounded-full" />
      </div>
    </div>
  );
}
