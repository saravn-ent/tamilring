'use client';

// Updated layout - Tabbed Interface
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr'; // Updated to SSR package
import UploadForm from '@/components/UploadForm';
import FavoritesList from '@/components/FavoritesList';
import LoginButton from '@/components/LoginButton';
import PersonalCollections from '@/components/PersonalCollections';
import { User, LogOut, Heart, Music, Trash2, X, Globe, Instagram, Twitter, Star, Disc, LayoutDashboard, UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Ringtone } from '@/types';
import AvatarRank from '@/components/AvatarRank';
import { getLevelTitle, syncUserGamification } from '@/lib/gamification';

// Removed global supabase client

export default function ProfilePage() {
  // Initialize Supabase Client for client-side usage
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [uploads, setUploads] = useState<Ringtone[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
  const router = useRouter();

  // Debug State
  const [debugLogs, setDebugLogs] = useState<string[]>(['Init...']); // Initial log
  const addLog = (msg: string) => {
    console.log(`[ProfileDebug] ${msg}`);
    setDebugLogs(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${msg}`]);
  };

  useEffect(() => {
    // Helper for timeouts
    const fetchWithTimeout = async (promise: any, ms = 3000, label = 'query') => {
      let timeoutId: NodeJS.Timeout;
      const timeoutPromise = new Promise<{ data: any, error: any }>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`${label} timed out`));
        }, ms);
      });

      try {
        const result = await Promise.race([promise, timeoutPromise]);
        clearTimeout(timeoutId!);
        return result as { data: any, error: any };
      } catch (error) {
        clearTimeout(timeoutId!);
        throw error;
      }
    };

    const getUser = async () => {
      try {
        addLog('Starting getUser...');
        addLog('Calling supabase.auth.getUser()...');
        const { data: { user } } = await supabase.auth.getUser();
        addLog(`User fetched: ${user?.id || 'No user'}`);
        setUser(user);

        if (user) {
          // Fetch Profile
          addLog('Fetching profile table...');
          // Using a shorter timeout for profile to fail fast
          try {
            const { data: profileData, error: profileError } = await fetchWithTimeout(
              supabase.from('profiles').select('*').eq('id', user.id).single(),
              4000,
              'Profile fetch'
            );

            if (profileError) {
              addLog(`Profile error: ${profileError.message} (${profileError.code})`);
            } else {
              addLog('Profile data received');
              setProfile(profileData);
              if (profileData) {
                setFullName(profileData.full_name || '');
                setBio(profileData.bio || '');
                setWebsite(profileData.website_url || '');
              }
            }
          } catch (e: any) {
            addLog(`PROFILE FETCH FAILED: ${e.message}`);
          }


          // Check and Sync Gamification Stats (Non-blocking)
          addLog('Triggering gamification sync (async)...');
          syncUserGamification(supabase, user.id).then((synced) => {
            if (synced) {
              setProfile((prev: any) => prev ? ({ ...prev, ...synced }) : prev);
            }
          }).catch(err => console.error("Gamification sync error", err));

          // Fetch Uploads
          addLog('Fetching ringtones table...');
          try {
            const { data: uploadsData, error: uploadsError } = await fetchWithTimeout(
              supabase.from('ringtones').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
              5000,
              'Uploads fetch'
            );

            if (uploadsError) addLog(`Uploads error: ${uploadsError.message}`);
            else addLog(`Uploads received: ${uploadsData?.length}`);

            if (uploadsData) {
              setUploads(uploadsData as unknown as Ringtone[]);
            }
          } catch (e: any) {
            addLog(`UPLOADS FETCH FAILED: ${e.message}`);
          }

          // Fetch Badges
          addLog('Fetching user_badges table...');
          try {
            const { data: badgesData, error: badgesError } = await fetchWithTimeout(
              supabase.from('user_badges').select('*, badge:badges(*)').eq('user_id', user.id),
              4000,
              'Badges fetch'
            );

            if (badgesError) addLog(`Badges error: ${badgesError.message}`);
            else addLog(`Badges received: ${badgesData?.length}`);

            if (badgesData) {
              setUserBadges(badgesData);
            }
          } catch (e: any) {
            addLog(`BADGES FETCH FAILED: ${e.message}`);
          }
        }
      } catch (error: any) {
        console.error("Error loading profile:", error);
        addLog(`CRITICAL ERROR: ${error.message}`);
      } finally {
        addLog('Finished loading sequence.');
        setLoading(false);
      }
    };

    getUser();
  }, [supabase]);

  // Auto-sync Google Name/Image
  useEffect(() => {
    if (user && profile && !loading) {
      const updates: any = {};
      let needsUpdate = false;

      if (!profile.full_name && user.user_metadata?.full_name) {
        updates.full_name = user.user_metadata.full_name;
        needsUpdate = true;
      } else if (!profile.full_name && user.email) {
        updates.full_name = user.email.split('@')[0];
        needsUpdate = true;
      }

      if (!profile.avatar_url && user.user_metadata?.avatar_url) {
        updates.avatar_url = user.user_metadata.avatar_url;
        needsUpdate = true;
      }

      if (needsUpdate) {
        supabase.from('profiles').update(updates).eq('id', user.id).then(({ error }) => {
          if (!error) {
            setProfile((prev: any) => ({ ...prev, ...updates }));
            setFullName(prev => prev || updates.full_name || '');
          }
        });
      }
    }
  }, [user, profile, loading, supabase]);

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
      console.error('Error updating profile:', error);
      alert(`Error updating profile: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setUploads([]);
    router.refresh();
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

  const handleForceSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error(e);
    }
    window.location.href = '/'; // Hard reload to clear state
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <div className="text-zinc-500 animate-pulse">Loading profile...</div>

        {/* Debug Log Box */}
        <div className="max-w-md w-full bg-neutral-900 p-4 rounded-lg font-mono text-xs text-left text-zinc-400 border border-neutral-800 h-64 overflow-y-auto">
          <div className="text-zinc-500 mb-2 border-b border-neutral-800 pb-1 flex justify-between">
            <span>Debug Log:</span>
            <button onClick={() => setDebugLogs([])} className="text-emerald-500 hover:text-emerald-400">Clear</button>
          </div>
          {debugLogs.map((log, i) => (
            <div key={i} className="whitespace-nowrap">{log}</div>
          ))}
          {debugLogs.length === 0 && <div>Initializing logs...</div>}
        </div>

        {/* Emergency Sign Out */}
        <button
          onClick={handleForceSignOut}
          className="mt-4 px-4 py-2 bg-red-500/10 text-red-500 text-sm font-bold rounded-lg border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/50 transition-colors"
        >
          Force Sign Out
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

      {/* 1. Header Section (Always Visible) */}
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
            <span className="text-zinc-500 font-medium text-[10px] uppercase tracking-wider">Reputation</span>
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

      {/* 2. Sticky Tab Navigation */}
      <div className="sticky top-14 z-20 bg-black/80 backdrop-blur-md border-b border-neutral-800 mb-4">
        <div className="flex w-full">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'overview'
              ? 'border-emerald-500 text-emerald-500'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
          >
            <LayoutDashboard size={16} /> Overview
          </button>
          <button
            onClick={() => setActiveTab('uploads')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'uploads'
              ? 'border-emerald-500 text-emerald-500'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
          >
            <Music size={16} /> My Rings
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'upload'
              ? 'border-emerald-500 text-white bg-emerald-500/10'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
          >
            <UploadCloud size={16} /> Upload
          </button>
        </div>
      </div>

      {/* 3. Content Sections */}
      <div className="flex-1 px-4 space-y-6">

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in slide-in-from-left-4 fade-in duration-300">
            {/* Badges */}
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

            {/* Personal Collections */}
            <PersonalCollections />

            {/* Favorites Section */}
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

        {/* TAB 2: MY UPLOADS */}
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
                <p className="text-zinc-600 text-xs mb-4">Share your first ringtone with the community</p>
                <button onClick={() => setActiveTab('upload')} className="text-emerald-500 text-xs font-bold hover:underline">Upload Now</button>
              </div>
            ) : (
              <div className="space-y-3">
                {uploads.map(ringtone => (
                  <div key={ringtone.id} className="flex items-center gap-3 bg-neutral-900/80 border border-neutral-800 p-3 rounded-xl group hover:border-emerald-500/30 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-neutral-800 relative overflow-hidden shrink-0">
                      {ringtone.poster_url ? (
                        <img src={ringtone.poster_url} alt={ringtone.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600"><Music size={16} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-zinc-200 truncate">{ringtone.title}</p>
                      <p className="text-xs text-zinc-500 truncate">{ringtone.movie_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize font-medium ${ringtone.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                          ringtone.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                            'bg-yellow-500/10 text-yellow-500'
                          }`}>
                          {ringtone.status}
                        </span>
                        <span className="text-[10px] text-zinc-600">
                          {new Date(ringtone.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(ringtone.id, e)}
                      className="p-2.5 text-zinc-500 hover:text-red-500 hover:bg-neutral-800 rounded-full transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: UPLOAD FORM */}
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
