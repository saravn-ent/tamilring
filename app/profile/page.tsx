'use client';

import { useEffect, useState, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Image from 'next/image';
import { User, Heart, Music, Trash2, X, CloudUpload, Star, CircleCheckBig, Wallet, Coins, ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { PostgrestError } from '@supabase/supabase-js';

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
import { getLevelTitle } from '@/lib/gamification';
import { Ringtone, Profile, Withdrawal, RingtoneRequest } from '@/types';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { handleWithdrawal, syncProfileStats } from '@/app/actions/user';
import { M3Tabs, M3Button, M3Badge, M3Card } from '@/components/ui/m3';

interface SyncProfileStatsResponse {
  success: boolean;
  stats?: {
    points: number;
    level: number;
    totalWithdrawn: number;
    lifetimePoints: number;
  } | null;
  error?: string;
}




// Simple timeout helper
function withTimeout<T>(promise: Promise<T>, ms: number = 5000): Promise<T> {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms))
  ]) as Promise<T>;
}

export default function ProfilePage() {
  // Stable Supabase Client
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [uploads, setUploads] = useState<Ringtone[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [ringtoneRequests, setRingtoneRequests] = useState<RingtoneRequest[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'upload' | 'uploads' | 'liked' | 'ledger'>('upload');

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
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
        type SupabaseRes<T> = { data: T | null; error: PostgrestError | unknown };

        const fetchProfile = withTimeout(supabase.from('profiles').select('*').eq('id', user.id).single() as unknown as Promise<SupabaseRes<Profile>>)
          .catch((e: unknown) => ({ data: null, error: e }));

        const fetchUploads = withTimeout(supabase.from('ringtones').select('*').eq('user_id', user.id).order('created_at', { ascending: false }) as unknown as Promise<SupabaseRes<Ringtone[]>>)
          .catch((e: unknown) => ({ data: null, error: e }));

        const fetchWithdrawals = withTimeout(supabase.from('withdrawals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }) as unknown as Promise<SupabaseRes<Withdrawal[]>>)
          .catch((e: unknown) => ({ data: null, error: e }));

        const fetchRequests = withTimeout(supabase.from('ringtone_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }) as unknown as Promise<SupabaseRes<RingtoneRequest[]>>)
          .catch((e: unknown) => ({ data: null, error: e }));


        const [profileRes, uploadsRes, withdrawalsRes, requestsRes] = await Promise.all([
          fetchProfile, fetchUploads, fetchWithdrawals, fetchRequests
        ]);

        if (!mounted) return;

        if (withdrawalsRes.data) setWithdrawals(withdrawalsRes.data as Withdrawal[]);
        if (requestsRes.data) setRingtoneRequests(requestsRes.data);

        // Handle Profile
        if (profileRes.data) {
          const profileData = profileRes.data;
          setProfile(profileData);
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
          .then((res: SyncProfileStatsResponse) => {
            if (res.success && res.stats && mounted) {
              setProfile((prev) => prev ? ({
                ...prev,
                points: res.stats!.points,
                level: res.stats!.level,
                total_withdrawn: res.stats!.totalWithdrawn,
                lifetime_points: res.stats!.lifetimePoints
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
    } catch {
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
    } catch {
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
    } catch {
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
            <h1 className="text-xl font-bold text-m3-on-surface tracking-tight leading-tight">
              {profile?.instagram_handle || profile?.twitter_handle || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Ringtone User'}
            </h1>
            <p className="text-xs text-m3-on-surface-variant font-normal truncate opacity-90 mt-0.5">{user.email}</p>
            <div className="flex items-center gap-2 mt-2.5">
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs font-semibold text-m3-primary hover:underline transition-opacity px-1 py-0.5"
              >
                Edit Profile
              </button>
              <span className="text-m3-outline-variant text-xs">•</span>
              <button
                onClick={handleSignOut}
                className="text-xs font-medium text-m3-on-surface-variant hover:text-m3-error transition-colors px-1 py-0.5"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* M3 Tonal Stats Cards */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          <div className="bg-m3-surface-container-low border border-m3-outline-variant/40 rounded-2xl p-3 text-center flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-m3-on-surface">
              {uploads?.filter(u => u.status === 'approved').length || 0}
            </span>
            <span className="text-[11px] font-medium text-m3-on-surface-variant mt-0.5">Ringtones</span>
          </div>
          <div className="bg-m3-surface-container-low border border-m3-outline-variant/40 rounded-2xl p-3 text-center flex flex-col items-center justify-center">
            <span className="text-sm font-bold text-amber-700 dark:text-amber-400 truncate max-w-full">
              {getLevelTitle(profile?.level || 1)}
            </span>
            <span className="text-[11px] font-medium text-m3-on-surface-variant mt-0.5">Rank</span>
          </div>
          <div className="bg-m3-surface-container-low border border-m3-outline-variant/40 rounded-2xl p-3 text-center flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-m3-primary">
              {profile?.points || 0}
            </span>
            <span className="text-[11px] font-medium text-m3-on-surface-variant mt-0.5">Rep Points</span>
          </div>
        </div>

        {/* M3 Financial Action Row */}
        <div className="flex items-center justify-between px-1">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-m3-on-surface leading-none tracking-tight">
                ₹{profile?.points || 0}
              </span>
              <M3Badge variant="secondary" size="small">
                Available
              </M3Badge>
            </div>
            <button
              className="text-[11px] font-medium text-m3-on-surface-variant flex items-center gap-1 hover:text-m3-on-surface transition-colors group"
              title="View payout history"
            >
              <span className="opacity-70 text-[10px] font-semibold">History:</span>
              <span className="text-m3-on-surface font-semibold">₹{profile?.total_withdrawn || 0} Claimed</span>
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform opacity-50" />
            </button>
          </div>

          <M3Button
            variant="filled"
            onClick={() => setIsWithdrawModalOpen(true)}
            disabled={!profile || profile.points < 100}
          >
            {profile && profile.points >= 100 ? 'Withdraw Funds' : `Need ₹${100 - (profile?.points || 0)}`}
          </M3Button>
        </div>
      </header>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-m3-surface-container-high border border-m3-outline-variant/40 rounded-[28px] p-6 shadow-2xl relative overflow-hidden">
            <button onClick={() => setIsEditing(false)} className="absolute top-5 right-5 text-m3-on-surface-variant hover:text-m3-on-surface transition-colors p-1 rounded-full hover:bg-m3-on-surface/8">
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-m3-on-surface mb-1">Edit Profile</h2>
            <p className="text-xs font-semibold text-m3-primary mb-5 bg-m3-primary-container/30 p-2.5 rounded-xl border border-m3-outline-variant/30 flex items-center gap-2">
              <Star size={14} fill="currentColor" /> Earn ₹10 per approved upload!
            </p>

            <form onSubmit={handleUpdateProfile} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-m3-on-surface-variant mb-1.5 block">Instagram</label>
                    <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} className="w-full bg-m3-surface-container-highest/60 border border-m3-outline-variant/50 rounded-xl px-3.5 py-2.5 text-sm focus:border-m3-primary outline-none transition-all text-m3-on-surface" placeholder="@handle" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-m3-on-surface-variant mb-1.5 block">X / Twitter</label>
                    <input type="text" value={twitter} onChange={e => setTwitter(e.target.value)} className="w-full bg-m3-surface-container-highest/60 border border-m3-outline-variant/50 rounded-xl px-3.5 py-2.5 text-sm focus:border-m3-primary outline-none transition-all text-m3-on-surface" placeholder="@handle" />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-m3-outline-variant/30 space-y-3">
                <p className="text-xs font-medium text-m3-on-surface-variant">Withdrawal Info</p>
                <div>
                  <label className="text-xs font-medium text-m3-on-surface-variant mb-1.5 block">UPI ID (For Payouts)</label>
                  <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} className="w-full bg-m3-surface-container-highest/60 border border-m3-outline-variant/50 rounded-xl px-3.5 py-2.5 text-sm focus:border-m3-primary outline-none transition-all text-m3-on-surface placeholder:text-m3-on-surface-variant/50" placeholder="yourname@upi" />
                </div>
              </div>

              <div className="pt-2">
                <M3Button type="submit" disabled={saving} variant="filled" fullWidth size="large">
                  {saving ? 'Syncing...' : 'Update Profile'}
                </M3Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-m3-surface-container-high border border-m3-outline-variant/40 rounded-[28px] p-6 shadow-2xl relative">
            <button onClick={() => setIsWithdrawModalOpen(false)} className="absolute top-5 right-5 text-m3-on-surface-variant hover:text-m3-on-surface transition-colors p-1 rounded-full hover:bg-m3-on-surface/8">
              <X size={20} />
            </button>

            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-m3-primary-container text-m3-on-primary-container rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                <Wallet size={28} />
              </div>
              <h2 className="text-xl font-bold text-m3-on-surface">Redeem Rewards</h2>
              <p className="text-xs text-m3-on-surface-variant mt-0.5">1 Rep Point = ₹1 Cash</p>
            </div>

            {withdrawSuccess ? (
              <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-300">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CircleCheckBig size={24} />
                </div>
                <p className="text-sm font-semibold text-emerald-600">Withdrawal Request sent!</p>
                <p className="text-xs text-m3-on-surface-variant">Wait for admin approval</p>
              </div>
            ) : (
              <form onSubmit={onWithdraw} className="space-y-4">
                <div className="bg-m3-surface-container-low p-3.5 rounded-2xl border border-m3-outline-variant/40 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-m3-on-surface-variant mb-0.5">Available Balance</p>
                    <p className="text-lg font-bold text-m3-on-surface">₹{profile?.points || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-medium text-m3-on-surface-variant mb-0.5">Min Withdrawal</p>
                    <p className="text-lg font-bold text-m3-primary">₹100</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-m3-on-surface-variant mb-1.5 block">Withdrawal Amount (₹)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full bg-m3-surface-container-highest/60 border border-m3-outline-variant/50 rounded-xl px-3.5 py-2.5 text-sm focus:border-m3-primary outline-none transition-all text-m3-on-surface"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-m3-on-surface-variant mb-1.5 block">UPI ID (For Instant Payout)</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    className="w-full bg-m3-surface-container-highest/60 border border-m3-outline-variant/50 rounded-xl px-3.5 py-2.5 text-sm focus:border-m3-primary outline-none transition-all text-m3-on-surface placeholder:text-m3-on-surface-variant/50"
                  />
                  {profile && !profile.upi_id && upiId && (
                    <p className="text-xs font-medium text-m3-primary mt-1">✨ Saved to your explorer profile</p>
                  )}
                </div>

                {withdrawError && (
                  <p className="text-xs font-medium text-m3-error text-center bg-m3-error-container/20 p-2 rounded-xl border border-m3-error/20">{withdrawError}</p>
                )}

                <M3Button
                  type="submit"
                  disabled={isWithdrawing || !upiId}
                  variant="filled"
                  fullWidth
                  size="large"
                >
                  {isWithdrawing ? 'Syncing...' : 'Request Payout Now'}
                </M3Button>
                <p className="text-[11px] text-m3-on-surface-variant text-center font-normal px-2">Withdrawals are processed manually by admins within 24-48 hours.</p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* M3 Primary Tabs */}
      <div className="sticky top-14 z-20 bg-m3-surface/95 backdrop-blur-md border-b border-m3-outline-variant/40 mb-6">
        <M3Tabs
          tabs={[
            { id: 'upload', label: 'Upload', icon: <CloudUpload size={16} /> },
            { id: 'uploads', label: 'My Rings', icon: <Music size={16} /> },
            { id: 'liked', label: 'Liked', icon: <Heart size={16} /> },
            { id: 'ledger', label: 'Finances', icon: <Coins size={16} /> },
          ]}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as 'upload' | 'uploads' | 'liked' | 'ledger')}
        />
      </div>

      <main className="flex-1 px-4">
        {activeTab === 'liked' && <LikedTabContent />}

        {activeTab === 'uploads' && (
          <div className="animate-in slide-in-from-right-4 fade-in duration-300 space-y-4 pb-20">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-bold text-m3-on-surface">My Contributions</h2>
              <span className="text-xs font-medium text-m3-on-surface-variant">{uploads.length} items</span>
            </div>

            {uploads.length === 0 ? (
              <div className="text-center py-14 px-4 bg-m3-surface-container-low rounded-3xl border border-dashed border-m3-outline-variant/40">
                <Music size={36} className="mx-auto text-m3-on-surface-variant/50 mb-3" />
                <p className="text-m3-on-surface font-semibold text-sm">Nothing posted yet</p>
                <button onClick={() => setActiveTab('upload')} className="text-m3-primary text-xs font-semibold mt-2 hover:underline">Start Contributing</button>
              </div>
            ) : (
              // Uploads List
              <div className="space-y-2.5">
                {uploads.map(ringtone => (
                  <div key={ringtone.id} className="flex items-center gap-3.5 bg-m3-surface-container-lowest border border-m3-outline-variant/40 p-3 rounded-2xl hover:bg-m3-surface-container-low transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-m3-surface-container-high relative overflow-hidden shrink-0">
                      {ringtone.poster_url ? (
                        <Image src={ringtone.poster_url} alt={ringtone.title} fill className="object-cover" sizes="48px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-m3-on-surface-variant/60"><Music size={18} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-m3-on-surface truncate">{ringtone.title}</p>
                      <div className="flex flex-col gap-1 mt-1">
                        <div className="flex items-center gap-2">
                          <M3Badge
                            variant={ringtone.status === 'approved' ? 'tertiary' : ringtone.status === 'rejected' ? 'error' : 'secondary'}
                            size="small"
                          >
                            {ringtone.status}
                          </M3Badge>
                        </div>
                        {ringtone.rejection_reason && (
                          <p className="text-[11px] text-m3-error font-medium leading-tight">
                            Reason: {ringtone.rejection_reason}
                          </p>
                        )}
                      </div>
                    </div>
                    <button onClick={(e) => handleDelete(ringtone.id, e)} className="p-2 text-m3-on-surface-variant hover:text-m3-error transition-colors rounded-full hover:bg-m3-error/10">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ledger' && (
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 space-y-6 pb-20">
            {/* M3 Earnings Banner */}
            <div className="bg-m3-primary text-m3-on-primary rounded-3xl p-6 shadow-md relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-xs font-medium uppercase tracking-wider opacity-80 mb-1">Total Earnings</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight">₹{profile?.lifetime_points || 0}</span>
                  <span className="text-xs font-medium opacity-80">lifetime</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-m3-on-primary/20">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider opacity-75 mb-0.5">Available</p>
                    <p className="text-xl font-bold">₹{profile?.points || 0}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider opacity-75 mb-0.5">Withdrawn</p>
                    <p className="text-xl font-bold opacity-80">₹{profile?.total_withdrawn || 0}</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-15 rotate-12 pointer-events-none">
                <Coins size={120} />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-m3-on-surface-variant uppercase tracking-wider ml-1">Transaction History</h3>

              {[
                ...uploads.filter(u => u.status === 'approved').map(u => ({
                  id: u.id,
                  type: 'upload',
                  title: u.title,
                  detail: 'Reward for approved upload',
                  amount: 10,
                  status: 'completed',
                  date: u.created_at,
                  utr: undefined
                })),
                ...withdrawals.map(w => ({
                  id: w.id,
                  type: 'withdrawal',
                  title: `Withdrawal Request`,
                  detail: `To ${w.upi_id}`,
                  utr: w.transaction_id,
                  amount: -w.amount,
                  status: w.status,
                  date: w.created_at
                })),
                ...ringtoneRequests.map(r => ({
                  id: r.id,
                  type: 'request',
                  title: `Custom Request`,
                  detail: `${r.song_name} (${r.movie_name})`,
                  amount: -10,
                  status: r.status === 'fulfilled' ? 'completed' : 'pending',
                  date: r.created_at,
                  utr: undefined
                }))
              ]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((item, idx) => (
                  <div key={idx} className="bg-m3-surface-container-lowest border border-m3-outline-variant/40 rounded-2xl p-3.5 flex items-center justify-between hover:bg-m3-surface-container-low transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                        ${item.type === 'upload' ? 'bg-emerald-500/10 text-emerald-600' :
                          item.type === 'withdrawal' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400' :
                            'bg-blue-500/10 text-blue-600'}`}>
                        {item.type === 'upload' ? <CloudUpload size={18} /> :
                          item.type === 'withdrawal' ? <Wallet size={18} /> :
                            <Star size={18} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-m3-on-surface truncate">{item.title}</p>
                        <p className="text-xs text-m3-on-surface-variant truncate">{item.detail}</p>
                        {item.utr && (
                          <p className="text-[10px] font-semibold text-m3-primary bg-m3-primary/10 px-2 py-0.5 rounded-md mt-1 inline-block">
                            UTR: {item.utr}
                          </p>
                        )}
                        <p className="text-[10px] text-m3-on-surface-variant/60 font-mono mt-0.5">{new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${item.amount > 0 ? 'text-emerald-600' : 'text-m3-on-surface'}`}>
                        {item.amount > 0 ? '+' : ''}{item.amount}
                      </p>
                      <span className={`text-[10px] font-semibold
                        ${item.status === 'completed' || item.status === 'fulfilled' ? 'text-emerald-600' :
                          item.status === 'rejected' ? 'text-m3-error' :
                            'text-amber-700 dark:text-amber-400 animate-pulse'}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}

              {uploads.length === 0 && withdrawals.length === 0 && ringtoneRequests.length === 0 && (
                <div className="text-center py-12 bg-m3-surface-container-low rounded-3xl border border-dashed border-m3-outline-variant/40">
                  <Coins size={32} className="mx-auto text-m3-on-surface-variant/40 mb-2" />
                  <p className="text-m3-on-surface-variant text-xs font-medium uppercase tracking-wider">No transactions yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'liked' && <LikedTabContent />}

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
