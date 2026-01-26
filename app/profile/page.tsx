'use client';

import { useEffect, useState, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User, Heart, Music, Trash2, X, CloudUpload, Star, ArrowUpRight, CircleCheckBig, Wallet, Coins, ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';

const UploadForm = dynamic(() => import('@/components/UploadForm'), {
  ssr: false,
  loading: () => <div className="p-12 text-center animate-pulse text-zinc-500 font-mono text-xs">Preparing Workspace...</div>
});
import FavoritesList from '@/components/FavoritesList';
import LoginButton from '@/components/LoginButton';
import PersonalCollections from '@/components/PersonalCollections';
import RingtoneCard from '@/components/RingtoneCard';
import { useFavorites } from '@/context/FavoritesContext';
import AvatarRank from '@/components/AvatarRank';
import { getLevelTitle, syncUserGamification, POINTS_PER_UPLOAD } from '@/lib/gamification';
import { Ringtone, Profile, UserBadge } from '@/types';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { handleWithdrawal, syncProfileStats } from '@/app/actions/user';


// Simple timeout helper
function withTimeout<T>(promise: Promise<T>, ms: number = 5000): Promise<T> {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms))
  ]) as Promise<T>;
}

export default function ProfilePage() {
  const router = useRouter();

  // Stable Supabase Client
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [uploads, setUploads] = useState<Ringtone[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'upload' | 'uploads' | 'liked'>('upload');

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

  // Withdrawal Modal State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

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
        type SupabaseRes<T> = { data: T | null; error: any };

        const fetchProfile = withTimeout(supabase.from('profiles').select('*').eq('id', user.id).single() as unknown as Promise<SupabaseRes<Profile>>)
          .catch((e: unknown) => ({ data: null, error: e }));

        const fetchUploads = withTimeout(supabase.from('ringtones').select('*').eq('user_id', user.id).order('created_at', { ascending: false }) as unknown as Promise<SupabaseRes<Ringtone[]>>)
          .catch((e: unknown) => ({ data: null, error: e }));

        const fetchBadges = withTimeout(supabase.from('user_badges').select('*, badge:badges(*)').eq('user_id', user.id) as unknown as Promise<SupabaseRes<UserBadge[]>>)
          .catch((e: unknown) => ({ data: null, error: e }));


        const [profileRes, uploadsRes, badgesRes] = await Promise.all([
          fetchProfile, fetchUploads, fetchBadges
        ]);

        if (!mounted) return;

        if (badgesRes.data) setUserBadges(badgesRes.data);

        // Handle Profile
        if (profileRes.data) {
          const profileData = profileRes.data;
          setProfile(profileData);
          setFullName(profileData.full_name || '');
          setBio(profileData.bio || '');
          setWebsite(profileData.website_url || '');
          setInstagram(profileData.instagram_handle || '');
          setTwitter(profileData.twitter_handle || '');
          setUpiId(profileData.upi_id || '');
          setBtcAddress(profileData.btc_address || '');

          if (uploadsRes.data) {
            setUploads(uploadsRes.data as Ringtone[]);
          }
        }

        // Server-Side Gamification Sync
        syncProfileStats(user.id)
          .then((res: any) => {
            if (res.success && res.stats && mounted) {
              setProfile((prev) => prev ? ({
                ...prev,
                points: res.stats.points,
                level: res.stats.level,
                total_withdrawn: res.stats.totalWithdrawn,
                lifetime_points: res.stats.lifetimePoints
              }) : null);
            }
          })
          .catch(console.error);

      } catch (err: unknown) {
        console.error('Fatal load error:', err);
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load profile');
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
      const updates: Partial<Profile> & { id: string } = {
        id: user.id,
        website_url: website,
        instagram_handle: instagram,
        twitter_handle: twitter,
        upi_id: upiId,
        btc_address: btcAddress,
      };
      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
      setProfile(prev => prev ? ({ ...prev, ...updates }) : null);
      setIsEditing(false);
    } catch (error: unknown) {
      alert(`Error updating profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  const onWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !user) return;

    const amount = parseInt(withdrawAmount);
    if (isNaN(amount) || amount < 100) {
      setWithdrawError('Minimum withdrawal is ₹100');
      return;
    }

    if (amount > profile.points) {
      setWithdrawError('Insufficient balance');
      return;
    }

    if (!profile.upi_id) {
      setWithdrawError('Please add a UPI ID in Edit Profile first');
      return;
    }

    setIsWithdrawing(true);
    setWithdrawError(null);

    try {
      // 1. If UPI ID was changed/set in modal, update profile first
      if (upiId !== profile.upi_id) {
        const { error: upiError } = await supabase
          .from('profiles')
          .update({ upi_id: upiId })
          .eq('id', user.id);

        if (upiError) throw new Error('Failed to save UPI ID');
        setProfile(prev => prev ? ({ ...prev, upi_id: upiId }) : null);
      }

      const res = await handleWithdrawal(user.id, amount, upiId);
      if (res.success) {
        setWithdrawSuccess(true);
        // Refresh profile points
        setProfile(prev => prev ? ({ ...prev, points: prev.points - amount }) : null);
        setTimeout(() => {
          setIsWithdrawModalOpen(false);
          setWithdrawSuccess(false);
          setWithdrawAmount('');
        }, 3000);
      } else {
        setWithdrawError(res.error || 'Withdrawal failed');
      }
    } catch (err) {
      setWithdrawError('An unexpected error occurred');
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-500 font-mono text-sm">Loading profile data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 p-4 text-center">
        <p className="text-red-500 font-bold">Something went wrong</p>
        <p className="text-zinc-500 text-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-brand-dark text-white font-bold rounded-lg mr-2">Try Again</button>
        <button onClick={handleSignOut} className="text-zinc-500 hover:text-zinc-300 text-sm">Sign Out</button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto p-4 flex flex-col min-h-[calc(100vh-120px)] items-center justify-center text-center space-y-6">
        <div className="w-24 h-24 bg-brand-wash border border-brand-border rounded-full flex items-center justify-center text-brand-dark shadow-lg shadow-brand-dark/5">
          <User size={48} />
        </div>
        <h1 className="text-2xl font-bold text-brand-dark">Guest User</h1>
        <p className="text-zinc-500 max-w-xs">Sign in to view your profile and contributions.</p>
        <LoginButton />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col pb-24">
      {/* Header Area */}
      <header className="pt-8 pb-6 px-6">
        {/* User Identity Section */}
        <div className="flex items-start gap-4 mb-6">
          <AvatarRank
            image={profile?.avatar_url || user.user_metadata?.avatar_url}
            point={profile?.points || 0}
            level={profile?.level || 1}
            size="sm"
          />
          <div className="flex-1 min-w-0 pt-0.5">
            <h1 className="text-lg font-bold text-brand-dark leading-tight">
              {profile?.instagram_handle || profile?.twitter_handle || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Ringtone User'}
            </h1>
            <p className="text-[11px] text-zinc-400 font-medium truncate opacity-90 mt-1">{user.email}</p>
            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={() => setIsEditing(true)}
                className="text-[10px] font-black uppercase tracking-widest text-brand-accent hover:opacity-80 transition-opacity"
              >
                Edit Profile
              </button>
              <button
                onClick={handleSignOut}
                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Optimized Stats Grid */}
        <div className="grid grid-cols-3 gap-0 border-t border-b border-brand-wash py-5 mb-6">
          <div className="flex flex-col items-center">
            <span className="text-lg font-black text-brand-dark">
              {uploads?.filter(u => u.status === 'approved').length || 0}
            </span>
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-1">Ringtones</span>
          </div>
          <div className="flex flex-col items-center border-x border-brand-wash">
            <span className="text-lg font-black text-amber-500">
              {getLevelTitle(profile?.level || 1)}
            </span>
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-1">Explorer Rank</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-black text-brand-accent">
              {profile?.points || 0}
            </span>
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-1">Rep Points</span>
          </div>
        </div>

        {/* Pro Financial Action Row */}
        <div className="flex items-center justify-between px-1">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-brand-dark leading-none tracking-tight">
                ₹{profile?.points || 0}
              </span>
              <span className="text-[8px] font-black bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded-full uppercase tracking-tighter">
                Available
              </span>
            </div>
            <button
              className="text-[10px] font-bold text-zinc-400 flex items-center gap-1 hover:text-brand-dark transition-colors group"
              title="View payout history"
            >
              <span className="opacity-60 uppercase text-[8px] font-black tracking-widest">History:</span>
              <span className="text-zinc-600 font-bold">₹{profile?.total_withdrawn || 0} Claimed</span>
              <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform opacity-40" />
            </button>
          </div>

          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            disabled={!profile || profile.points < 100}
            className={`px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-xl
              ${profile && profile.points >= 100
                ? 'bg-brand-dark text-white shadow-brand-dark/20 hover:bg-black'
                : 'bg-zinc-100 text-zinc-300 cursor-not-allowed'}`}
          >
            {profile && profile.points >= 100 ? 'Withdraw Funds' : `Need ₹${100 - (profile?.points || 0)}`}
          </button>
        </div>
      </header>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white border border-brand-border rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <button onClick={() => setIsEditing(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-brand-dark transition-colors">
              <X size={20} />
            </button>

            <h2 className="text-xl font-black text-brand-dark mb-1 uppercase tracking-tight">Edit Profile</h2>
            <p className="text-[10px] font-bold text-brand-accent mb-6 bg-brand-wash p-2 rounded-lg border border-brand-border flex items-center gap-2">
              <Star size={12} fill="currentColor" /> EARN ₹10 PER APPROVED UPLOAD!
            </p>

            <form onSubmit={handleUpdateProfile} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block ml-1">Instagram</label>
                    <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} className="w-full bg-brand-wash border border-brand-border rounded-xl px-4 py-3 text-sm focus:border-brand-accent outline-none transition-all font-mono text-[11px] text-brand-dark" placeholder="@handle" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block ml-1">X / Twitter</label>
                    <input type="text" value={twitter} onChange={e => setTwitter(e.target.value)} className="w-full bg-brand-wash border border-brand-border rounded-xl px-4 py-3 text-sm focus:border-brand-accent outline-none transition-all font-mono text-[11px] text-brand-dark" placeholder="@handle" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-brand-border space-y-4">
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Withdrawal Info</p>
                <div>
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block ml-1">UPI ID (For Payouts)</label>
                  <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} className="w-full bg-brand-wash/50 border border-brand-border/50 rounded-xl px-4 py-3 text-sm focus:border-brand-accent outline-none transition-all font-mono text-[11px] text-brand-dark placeholder:text-zinc-400" placeholder="yourname@upi" />
                </div>
              </div>

              <button type="submit" disabled={saving} className="w-full py-4 bg-brand-dark text-white font-black rounded-2xl hover:bg-neutral-800 transition-all disabled:opacity-50 shadow-xl shadow-brand-dark/20 uppercase tracking-widest text-[11px] mt-4">
                {saving ? 'Syncing...' : 'Update Explorer Profile'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white border border-brand-border rounded-3xl p-6 shadow-2xl relative">
            <button onClick={() => setIsWithdrawModalOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-brand-dark transition-colors">
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-brand-dark rounded-full flex items-center justify-center text-white mx-auto mb-3 shadow-xl">
                <Wallet size={32} />
              </div>
              <h2 className="text-xl font-black text-brand-dark uppercase tracking-tight">Redeem Rewards</h2>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1 italic">1 Rep Point = ₹1 Cash</p>
            </div>

            {withdrawSuccess ? (
              <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-300">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <CircleCheckBig size={24} />
                </div>
                <p className="text-sm font-bold text-emerald-600">Withdrawal Request sent!</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black italic">Wait for admin approval</p>
              </div>
            ) : (
              <form onSubmit={onWithdraw} className="space-y-4">
                <div className="bg-brand-wash p-4 rounded-2xl border border-brand-border flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Available Balance</p>
                    <p className="text-lg font-black text-brand-dark">₹{profile?.points || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Min Withdrawal</p>
                    <p className="text-lg font-black text-brand-accent">₹100</p>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block ml-1">Withdrawal Amount (₹)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full bg-brand-wash border border-brand-border rounded-xl px-4 py-3 text-sm focus:border-brand-accent outline-none transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block ml-1">UPI ID (For Instant Payout)</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    className="w-full bg-brand-wash border border-brand-border rounded-xl px-4 py-3 text-sm focus:border-brand-accent outline-none transition-all font-mono text-brand-dark"
                  />
                  {profile && !profile.upi_id && upiId && (
                    <p className="text-[9px] font-bold text-brand-accent mt-1 animate-pulse">✨ We'll save this to your explorer profile</p>
                  )}
                </div>

                {withdrawError && (
                  <p className="text-[10px] font-bold text-red-500 text-center bg-red-50 p-2 rounded-lg border border-red-100">{withdrawError}</p>
                )}

                <button
                  type="submit"
                  disabled={isWithdrawing || !upiId}
                  className="w-full py-4 bg-brand-accent text-white font-black rounded-2xl hover:bg-brand-accent/90 transition-all disabled:opacity-50 shadow-xl shadow-brand-accent/20 uppercase tracking-widest text-xs active:scale-[0.98]"
                >
                  {isWithdrawing ? 'Syncing Ledger...' : 'Request Payout Now'}
                </button>
                <p className="text-[9px] text-zinc-400 text-center font-medium px-4">Withdrawals are processed manually by admins within 24-48 hours.</p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="sticky top-14 z-20 bg-white/95 backdrop-blur-md border-b border-brand-border mb-6">
        <div className="flex w-full px-2">
          {['upload', 'uploads', 'liked'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all flex items-center justify-center gap-2 ${activeTab === tab ? 'border-brand-accent text-brand-accent bg-brand-accent/5' : 'border-transparent text-zinc-400 hover:text-brand-dark'}`}
            >
              {tab === 'liked' && <Heart size={14} />}
              {tab === 'uploads' && <Music size={14} />}
              {tab === 'upload' && <CloudUpload size={14} />}
              <span>{tab === 'uploads' ? 'My Rings' : tab === 'liked' ? 'Liked' : tab}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 px-4">
        {activeTab === 'liked' && <LikedTabContent />}

        {activeTab === 'uploads' && (
          <div className="animate-in slide-in-from-right-4 fade-in duration-300 space-y-4 pb-20">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-black text-brand-dark uppercase tracking-tighter">My Contributions</h2>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{uploads.length} items</span>
            </div>

            {uploads.length === 0 ? (
              <div className="text-center py-16 bg-brand-wash rounded-3xl border border-dashed border-brand-border">
                <Music size={40} className="mx-auto text-zinc-400 mb-4" />
                <p className="text-zinc-500 font-bold text-sm">Nothing posted yet</p>
                <button onClick={() => setActiveTab('upload')} className="text-brand-accent text-[10px] font-black uppercase mt-2 tracking-widest hover:underline">Start Contributing</button>
              </div>
            ) : (
              // Uploads List
              <div className="space-y-3">
                {uploads.map(ringtone => (
                  <div key={ringtone.id} className="flex items-center gap-4 bg-white border border-brand-border p-3 rounded-2xl hover:border-brand-accent/30 transition-all group shadow-sm">
                    <div className="w-14 h-14 rounded-xl bg-brand-wash relative overflow-hidden shrink-0 shadow-inner">
                      {ringtone.poster_url ? (
                        <Image src={ringtone.poster_url} alt={ringtone.title} fill className="object-cover" sizes="56px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400"><Music size={18} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-brand-dark truncate">{ringtone.title}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border ${ringtone.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          ringtone.status === 'rejected' ? 'bg-red-50 text-red-500 border-red-100' :
                            'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                          {ringtone.status}
                        </span>
                      </div>
                    </div>
                    <button onClick={(e) => handleDelete(ringtone.id, e)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
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
            <UploadForm userId={user.id} onComplete={() => {
              setActiveTab('uploads');
              window.location.reload();
            }} />
          </div>
        )}
      </main>

      <div className="pt-10 flex flex-col items-center pb-20 opacity-40">
        <p className="text-[9px] text-zinc-400 font-black uppercase tracking-[0.2em]">Member since {new Date(user.created_at).getFullYear()}</p>
        <div className="w-12 h-0.5 bg-brand-border mt-2 rounded-full" />
      </div>
    </div>
  );
}
// Sub-component for Liked Tab Content
function LikedTabContent() {
  const { favorites } = useFavorites();
  const likedRingtones = favorites.filter(fav => fav.type === 'Ringtone');
  const likedArtists = favorites.filter(fav => fav.type !== 'Ringtone');

  return (
    <div className="animate-in slide-in-from-left-4 fade-in duration-300 space-y-8 pb-20">
      <PersonalCollections />

      {likedArtists.length > 0 && (
        <section>
          <h2 className="text-lg font-black text-brand-dark mb-4 flex items-center gap-3 uppercase tracking-tighter">
            <User size={20} className="text-brand-accent" fill="currentColor" />
            Artists & Movies
          </h2>
          <FavoritesList items={likedArtists} />
        </section>
      )}

      <section>
        <h2 className="text-lg font-black text-brand-dark mb-4 flex items-center gap-3 uppercase tracking-tighter">
          <Heart size={20} className="text-brand-accent" fill="currentColor" />
          Liked Ringtones
        </h2>
        {likedRingtones.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {likedRingtones.map((fav) => (
              fav.ringtoneData && <RingtoneCard key={fav.id} ringtone={fav.ringtoneData} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-brand-wash rounded-2xl border border-dashed border-brand-border">
            <p className="text-zinc-500 text-sm font-medium">No liked ringtones yet</p>
          </div>
        )}
      </section>
    </div>
  );
}
