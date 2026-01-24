'use client';

import { useEffect, useState, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User, Heart, Music, Trash2, X, UploadCloud, Star } from 'lucide-react';
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

        // Handle Uploads & Recalculate Points
        let currentPoints = 0;
        let currentLevel = 1;
        if (uploadsRes.data) {
          const uploadsData = uploadsRes.data as Ringtone[];
          setUploads(uploadsData);
          const approvedCount = uploadsData.filter(u => u.status === 'approved').length;
          currentPoints = approvedCount * POINTS_PER_UPLOAD;
          currentLevel = Math.floor(currentPoints / 500) + 1;
        }

        if (badgesRes.data) setUserBadges(badgesRes.data);

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
          .then((synced: Partial<Profile> | null) => {
            if (synced && mounted) setProfile((prev) => prev ? ({ ...prev, ...synced }) : null);
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
        full_name: fullName,
        bio,
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
        <h1 className="text-2xl font-bold text-brand-dark mb-1">
          {profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Ringtone User'}
        </h1>
        <p className="text-xs text-zinc-500 mb-4 font-mono">{user.email}</p>
        {profile?.bio && <p className="text-zinc-600 text-sm max-w-sm text-center mb-4 leading-relaxed italic">"{profile.bio}"</p>}

        {/* Stats */}
        <div className="flex items-center gap-6 mb-6 text-sm">
          <div className="flex flex-col items-center">
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-brand-dark text-xl">{uploads?.filter(u => u.status === 'approved').length || 0}</span>
              {uploads?.some(u => u.status === 'pending') && (
                <span className="text-zinc-500 text-[10px]">/ {uploads?.length}</span>
              )}
            </div>
            <span className="text-zinc-500 font-medium text-[10px] uppercase tracking-wider">Ringtones</span>
          </div>
          <div className="w-px h-8 bg-brand-border" />
          <div className="flex flex-col items-center">
            <span className="font-bold text-brand-accent text-xl">{profile?.points || 0}</span>
            <span className="text-zinc-500 font-medium text-[10px] uppercase tracking-wider">Rep Points</span>
          </div>
          <div className="w-px h-8 bg-brand-border" />
          <div className="flex flex-col items-center">
            <span className="font-bold text-amber-500 text-xl">{getLevelTitle(profile?.level || 1)}</span>
            <span className="text-zinc-500 font-medium text-[10px] uppercase tracking-wider">Level</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 bg-brand-dark text-white text-xs font-black rounded-full hover:bg-brand-dark/90 transition-all shadow-md shadow-brand-dark/20 uppercase tracking-widest"
          >
            Edit Profile
          </button>
          <button
            onClick={handleSignOut}
            className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-all border border-red-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Edit Profile Modal */}
        {isEditing && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-white border border-brand-border rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <button onClick={() => setIsEditing(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-brand-dark transition-colors">
                <X size={20} />
              </button>

              <h2 className="text-xl font-black text-brand-dark mb-1 uppercase tracking-tight">Edit Profile</h2>
              <p className="text-[10px] font-bold text-brand-accent mb-6 bg-brand-wash p-2 rounded-lg border border-brand-border flex items-center gap-2">
                <Star size={12} fill="currentColor" /> EARN ₹15 PER APPROVED UPLOAD!
              </p>

              <form onSubmit={handleUpdateProfile} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block ml-1">Full Name</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-brand-wash border border-brand-border rounded-xl px-4 py-3 text-sm focus:border-brand-accent outline-none transition-all placeholder:text-zinc-400 text-brand-dark" placeholder="Display Name" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block ml-1">Bio</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full bg-brand-wash border border-brand-border rounded-xl px-4 py-3 text-sm focus:border-brand-accent outline-none transition-all resize-none placeholder:text-zinc-400 text-brand-dark" placeholder="Tell the world about yourself..." />
                  </div>
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
      </header>

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
              {tab === 'upload' && <UploadCloud size={14} />}
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
