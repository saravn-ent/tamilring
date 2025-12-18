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
        console.log('Starting profile load...');
        // 1. Get User
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
          console.warn("Auth error (handled as guest):", authError.message);
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

        // 2. Load fetching in parallel with separate error handling
        console.log('Fetching user data...');

        // We use 'any' to bypass strict TypeScript checks on the PostgrestBuilder promise
        const fetchProfile = withTimeout(supabase.from('profiles').select('*').eq('id', user.id).single())
          .catch((e: any) => ({ error: e }));

        const fetchUploads = withTimeout(supabase.from('ringtones').select('*').eq('user_id', user.id).order('created_at', { ascending: false }))
          .catch((e: any) => ({ error: e }));

        const fetchBadges = withTimeout(supabase.from('user_badges').select('*, badge:badges(*)').eq('user_id', user.id))
          .catch((e: any) => ({ error: e }));

        const [profileRes, uploadsRes, badgesRes] = await Promise.all([fetchProfile, fetchUploads, fetchBadges]);

        if (!mounted) return;

        // Handle Uploads & Recalculate Points locally for instant update
        let currentPoints = 0;
        let currentLevel = 1;

        if (uploadsRes.data) {
          setUploads(uploadsRes.data as any[]);
          const approvedCount = (uploadsRes.data as any[]).filter(u => u.status === 'approved').length;
          currentPoints = approvedCount * POINTS_PER_UPLOAD;
          currentLevel = Math.floor(currentPoints / 500) + 1;
        } else {
          console.error('Uploads fetch failed:', uploadsRes.error);
          currentPoints = profileRes.data?.points || 0;
          currentLevel = profileRes.data?.level || 1;
        }

        // Handle Badges
        if (badgesRes.data) setUserBadges(badgesRes.data);
        else console.error('Badges fetch failed:', badgesRes.error);

        // Handle Profile (Use calculated points/level)
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
        } else if (profileRes.error) {
          console.error('Profile fetch failed:', profileRes.error);
        }

        // Async Gamification Sync (Don't await)
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
      console.error(e);
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
        <button
          onClick={handleSignOut}
          className="mt-8 text-xs text-red-500 hover:text-red-400 hover:underline"
        >
          Stuck? Force Sign Out
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 p-4 text-center">
        <p className="text-red-500 font-bold">Something went wrong</p>
        <p className="text-zinc-500 text-sm max-w-md">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400">
          Try Again
        </button>
        <button onClick={handleSignOut} className="text-zinc-500 hover:text-zinc-300 text-sm">
          Sign Out
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto p-4 flex flex-col min-h-[calc(100vh-120px)]">
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center text-zinc-500 shadow-xl shadow-black/20">
            <User size={48} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 mb-2">Guest User</h1>
            <p className="text-zinc-400 max-w-xs mx-auto">Sign in to view your profile, upload ringtones, and manage your favorites.</p>
          </div>
          <LoginButton />
        </div>
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
        {profile?.bio && <p className="text-zinc-400 text-sm max-w-sm text-center mb-4">{profile.bio}</p>}

        {/* Stats */}
        <div className="flex items-center gap-6 mb-6 text-sm">
          <div className="flex flex-col items-center">
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-white text-xl">{uploads?.filter(u => u.status === 'approved').length || 0}</span>
              {uploads?.some(u => u.status === 'pending') && (
                <span className="text-zinc-500 text-xs">/ {uploads?.length}</span>
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

        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-1.5 bg-neutral-800 text-zinc-300 text-xs font-bold rounded-full hover:bg-neutral-700 transition-colors border border-neutral-700"
          >
            Edit Profile
          </button>
          <button
            onClick={handleSignOut}
            className="px-4 py-1.5 bg-neutral-800/50 text-red-400 text-xs font-bold rounded-full hover:bg-red-900/20 transition-colors border border-neutral-800"
          >
            Sign Out
          </button>
        </div>

        {/* Edit Modal */}
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
              <button
                onClick={() => setIsEditing(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold mb-1">Edit Profile</h2>
              <p className="text-xs text-emerald-400 font-medium mb-4 flex items-center gap-1.5 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                <span className="text-lg">💰</span>
                <span>Earn <b>₹15</b> for every approved ringtone! Add your payment details below.</span>
              </p>

              <form onSubmit={handleUpdateProfile} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">User Name</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your name" className="w-full bg-black/50 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Bio</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full bg-black/50 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none transition-colors h-20 resize-none" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Instagram ID</label>
                  <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@username" className="w-full bg-black/50 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none transition-colors" />
                </div>

                <div className="pt-2 border-t border-white/5">
                  <p className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">Payment Details</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-zinc-500 block mb-1">UPI ID (GPay/PhonePe)</label>
                      <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="username@upi" className="w-full bg-black/50 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none transition-colors font-mono" />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 block mb-1">Bitcoin Address (BTC)</label>
                      <input type="text" value={btcAddress} onChange={e => setBtcAddress(e.target.value)} placeholder="bc1q..." className="w-full bg-black/50 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none transition-colors font-mono" />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={saving} className="w-full py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50 mt-2">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Sticky Tab Navigation */}
      <div className="sticky top-14 z-20 bg-black/80 backdrop-blur-md border-b border-neutral-800 mb-4">
        <div className="flex w-full">
          {['overview', 'uploads', 'upload'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === tab ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
            >
              {tab === 'overview' && <LayoutDashboard size={16} />}
              {tab === 'uploads' && <Music size={16} />}
              {tab === 'upload' && <UploadCloud size={16} />}
              <span className="capitalize">{tab === 'uploads' ? 'My Rings' : tab}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Content */}
      <div className="flex-1 px-4 space-y-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in slide-in-from-left-4 fade-in duration-300">
            {userBadges && userBadges.length > 0 && (
              <div className="w-full">
                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 px-1">Badges & Achievements</h2>
                <div className="flex flex-wrap gap-2">
                  {userBadges.map((ub: any) => (
                    <div key={ub.id} className="w-10 h-10 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center relative group" title={ub.badge?.name}>
                      <Star size={16} className="text-yellow-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Reputation & Withdrawal Section */}
            <section className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Star className="text-amber-500" size={20} />
                    Reputation & Earnings
                  </h2>
                  <p className="text-xs text-zinc-500">1 Rep Point = 1 Rupee</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-500">{profile?.points || 0}</span>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Total Rep</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-zinc-400">Withdrawal Threshold</span>
                    <span className="text-xs font-bold text-white">
                      {profile?.total_withdrawn_count === 0 ? '15 Rep' : '1000 Rep'}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-1000"
                      style={{
                        width: `${Math.min(100, ((profile?.points || 0) / (profile?.total_withdrawn_count === 0 ? 15 : 1000)) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="Enter UPI ID (e.g. yourname@upi)"
                      className="w-full bg-black/50 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-colors"
                    />
                  </div>

                  <button
                    disabled={saving || (profile?.points || 0) < (profile?.total_withdrawn_count === 0 ? 15 : 1000) || !upiId}
                    onClick={async () => {
                      setSaving(true);
                      const res = await handleWithdrawal(user.id, profile.points, upiId);
                      if (res.success) {
                        alert('Withdrawal request submitted successfully!');
                        window.location.reload();
                      } else {
                        alert(res.error || 'Withdrawal failed');
                      }
                      setSaving(false);
                    }}
                    className="w-full py-3 bg-emerald-500 text-black font-black rounded-xl hover:bg-emerald-400 disabled:opacity-30 disabled:grayscale transition-all"
                  >
                    Withdraw Rep
                  </button>
                  <p className="text-[10px] text-center text-zinc-600">
                    {profile?.total_withdrawn_count === 0
                      ? "First withdrawal available immediately at 15 Rep!"
                      : `You need ${1000 - (profile?.points || 0)} more Rep to withdraw again.`}
                  </p>
                </div>
              </div>
            </section>

            <PersonalCollections />
            <section>
              <h2 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
                <Heart size={20} className="text-emerald-500" />
                My Favorites
              </h2>
              <FavoritesList />
            </section>
            <div className="pt-8 flex justify-center pb-8">
              <p className="text-[10px] text-zinc-700 uppercase tracking-widest">User since {new Date(user.created_at).getFullYear()}</p>
            </div>
          </div>
        )}

        {/* TAB 2: UPLOADS */}
        {activeTab === 'uploads' && (
          <div className="animate-in slide-in-from-right-4 fade-in duration-300 pb-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Music size={20} className="text-emerald-500" />
                All Contributions
              </h2>
              <span className="text-xs font-bold text-zinc-500">{uploads.length} Ringtones</span>
            </div>

            {uploads.length === 0 ? (
              <div className="text-center py-12 bg-neutral-900/50 rounded-xl border border-dashed border-neutral-800">
                <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-3 text-zinc-600">
                  <Music size={24} />
                </div>
                <p className="text-zinc-400 font-medium mb-1">No uploads yet</p>
                <button onClick={() => setActiveTab('upload')} className="text-emerald-500 text-xs font-bold hover:underline">Upload Now</button>
              </div>
            ) : (
              <div className="space-y-3">
                {uploads.map(ringtone => (
                  <div key={ringtone.id} className="flex items-center gap-3 bg-neutral-900/80 border border-neutral-800 p-3 rounded-xl group hover:border-emerald-500/30 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-neutral-800 relative overflow-hidden shrink-0">
                      {ringtone.poster_url ? (
                        <Image src={ringtone.poster_url} alt={ringtone.title} fill className="object-cover" sizes="48px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600"><Music size={16} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-zinc-200 truncate">{ringtone.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize font-medium ${ringtone.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                          ringtone.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                            'bg-yellow-500/10 text-yellow-500'
                          }`}>
                          {ringtone.status}
                        </span>
                      </div>
                    </div>
                    <button onClick={(e) => handleDelete(ringtone.id, e)} className="p-2 text-zinc-500 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: UPLOAD */}
        {activeTab === 'upload' && (
          <div className="animate-in zoom-in-95 fade-in duration-300 pb-20">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-1">
              <UploadForm />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
