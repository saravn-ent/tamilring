'use client';
// Updated layout - removed Settings, adjusted footer spacing
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import UploadForm from '@/components/UploadForm';
import FavoritesList from '@/components/FavoritesList';
import RingtoneCard from '@/components/RingtoneCard';
import LoginButton from '@/components/LoginButton';
import PersonalCollections from '@/components/PersonalCollections';
import { User, LogOut, Heart, Music, Trash2, Play, Pause, X, Globe, Instagram, Twitter, Trophy, Star, Crown, Zap, Scissors, Disc } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Ringtone } from '@/types';
import LegalFooter from '@/components/LegalFooter';
import AvatarRank from '@/components/AvatarRank';
import { getLevelTitle, syncUserGamification } from '@/lib/gamification';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [uploads, setUploads] = useState<Ringtone[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [showAllContributions, setShowAllContributions] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Fetch Profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
          setFullName(profileData.full_name || '');
          setBio(profileData.bio || '');
          setWebsite(profileData.website_url || '');
          setInstagram(profileData.instagram_handle || '');
          setTwitter(profileData.twitter_handle || '');

          // Check and Sync Gamification Stats (Self-Healing)
          syncUserGamification(supabase, user.id).then((synced) => {
            if (synced && (synced.points !== profileData.points || synced.level !== profileData.level)) {
              setProfile((prev: any) => ({ ...prev, ...synced }));
            }
          });
        }

        // Fetch Uploads
        const { data: uploadsData } = await supabase
          .from('ringtones')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (uploadsData) {
          // Cast to Ringtone type, ensuring types match
          setUploads(uploadsData as unknown as Ringtone[]);
        }

        // Fetch Badges
        const { data: badgesData } = await supabase
          .from('user_badges')
          .select('*, badge:badges(*)')
          .eq('user_id', user.id);

        if (badgesData) {
          setUserBadges(badgesData);
        }
      }
      setLoading(false);
    };

    getUser();
  }, [supabase]);

  // Auto-sync Google Name/Image to Profile if missing
  useEffect(() => {
    if (user && profile && !loading) {
      const updates: any = {};
      let needsUpdate = false;

      // Sync Name
      if (!profile.full_name && user.user_metadata?.full_name) {
        updates.full_name = user.user_metadata.full_name;
        needsUpdate = true;
      } else if (!profile.full_name && user.email) {
        // Fallback to email username if no name
        updates.full_name = user.email.split('@')[0];
        needsUpdate = true;
      }

      // Sync Avatar
      if (!profile.avatar_url && user.user_metadata?.avatar_url) {
        updates.avatar_url = user.user_metadata.avatar_url;
        needsUpdate = true;
      }

      if (needsUpdate) {
        supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)
          .then(({ error }) => {
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
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

      setProfile({ ...profile, ...updates });
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(`Error updating profile: ${error.message || 'Unknown error. Check console for details.'}`);
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
      const { error } = await supabase
        .from('ringtones')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setUploads(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      alert('Error deleting ringtone');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-500">Loading profile...</div>;
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
            <p className="text-zinc-400 max-w-xs mx-auto">
              Sign in to view your profile, upload ringtones, and manage your favorites.
            </p>
          </div>
          <LoginButton />
        </div>

        <div className="w-full mt-8">
          <hr className="border-neutral-800 mb-8" />
          <LegalFooter />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 pb-24 min-h-screen flex flex-col">
      <header className="flex flex-col items-center mb-8 relative">
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
            <span className="font-bold text-white text-xl">{uploads?.length || 0}</span>
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

        {/* Badges */}
        {userBadges && userBadges.length > 0 && (
          <div className="mb-6 w-full px-4">
            <div className="flex flex-wrap justify-center gap-2">
              {userBadges.map((ub: any) => {
                const Icon = ub.badge?.icon_name === 'scissors' ? Scissors :
                  ub.badge?.icon_name === 'zap' ? Zap :
                    ub.badge?.icon_name === 'crown' ? Crown :
                      ub.badge?.icon_name === 'heart' ? Heart :
                        ub.badge?.icon_name === 'music' ? Disc : Star;
                // Improved Badge Style Logic
                const getBadgeColor = (name: string) => {
                  switch (name) {
                    case 'crown': return {
                      bg: 'from-amber-500/30 to-black',
                      border: 'border-amber-500',
                      text: 'text-amber-400',
                      hex: '#fbbf24', // Amber 400
                      shadow: 'shadow-amber-500/40',
                      glow: 'group-hover:shadow-amber-500/60'
                    };
                    case 'zap': return {
                      bg: 'from-yellow-400/30 to-black',
                      border: 'border-yellow-400',
                      text: 'text-yellow-400',
                      hex: '#facc15', // Yellow 400
                      shadow: 'shadow-yellow-400/40',
                      glow: 'group-hover:shadow-yellow-400/60'
                    };
                    case 'heart': return {
                      bg: 'from-rose-500/30 to-black',
                      border: 'border-rose-500',
                      text: 'text-rose-400',
                      hex: '#fb7185', // Rose 400
                      shadow: 'shadow-rose-500/40',
                      glow: 'group-hover:shadow-rose-500/60'
                    };
                    case 'scissors': return {
                      bg: 'from-cyan-400/30 to-black',
                      border: 'border-cyan-400',
                      text: 'text-cyan-400',
                      hex: '#22d3ee', // Cyan 400
                      shadow: 'shadow-cyan-400/40',
                      glow: 'group-hover:shadow-cyan-400/60'
                    };
                    case 'music': return {
                      bg: 'from-violet-500/30 to-black',
                      border: 'border-violet-500',
                      text: 'text-violet-400',
                      hex: '#a78bfa', // Violet 400
                      shadow: 'shadow-violet-500/40',
                      glow: 'group-hover:shadow-violet-500/60'
                    };
                    default: return { // Star/Default
                      bg: 'from-emerald-500/30 to-black',
                      border: 'border-emerald-500',
                      text: 'text-emerald-400',
                      hex: '#34d399', // Emerald 400
                      shadow: 'shadow-emerald-500/40',
                      glow: 'group-hover:shadow-emerald-500/60'
                    };
                  }
                };

                const style = getBadgeColor(ub.badge?.icon_name);

                return (
                  <div key={ub.id} className="relative group cursor-help p-2">
                    {/* Main Badge Container */}
                    <div className={`
                      w-16 h-16 rounded-2xl border-2 flex items-center justify-center relative overflow-hidden transition-all duration-300 transform group-hover:-translate-y-1 group-hover:scale-105
                      bg-gradient-to-br ${style.bg}
                      ${style.border}
                      ${style.shadow} shadow-lg
                      ${style.glow}
                    `}>
                      {/* Glossy Reflection Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-50 pointer-events-none" />

                      {/* Subtle Inner Glow */}
                      <div className={`absolute inset-0 bg-${style.text.split('-')[1]}-500/10 blur-xl`} />

                      {/* Icon */}
                      <Icon
                        size={28}
                        color={style.hex}
                        fill={style.hex}
                        className={`relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] filter`}
                      />
                    </div>

                    {/* Badge Name Label (Little pill below) */}
                    <div className={`mt-2 text-[10px] font-bold uppercase tracking-wider text-center opacity-70 group-hover:opacity-100 transition-opacity ${style.text}`}>
                      {ub.badge?.name}
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 bg-black/90 backdrop-blur-xl p-3 rounded-xl text-xs text-center border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 shadow-2xl translate-y-2 group-hover:translate-y-0">
                      <p className={`font-bold text-sm mb-1 ${style.text}`}>{ub.badge?.name}</p>
                      <p className="text-zinc-400 leading-relaxed">{ub.badge?.description}</p>
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black border-r border-b border-white/10 rotate-45"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-3 mb-2">
          {profile?.website_url && (
            <a href={profile.website_url} target="_blank" rel="noreferrer" className="p-2 bg-neutral-800 rounded-full text-zinc-400 hover:text-emerald-400 hover:bg-neutral-700 transition-colors">
              <Globe size={18} />
            </a>
          )}
          {profile?.instagram_handle && (
            <a href={`https://instagram.com/${profile.instagram_handle.replace('@', '')}`} target="_blank" rel="noreferrer" className="p-2 bg-neutral-800 rounded-full text-zinc-400 hover:text-pink-500 hover:bg-neutral-700 transition-colors">
              <Instagram size={18} />
            </a>
          )}
          {profile?.twitter_handle && (
            <a href={`https://twitter.com/${profile.twitter_handle.replace('@', '')}`} target="_blank" rel="noreferrer" className="p-2 bg-neutral-800 rounded-full text-zinc-400 hover:text-blue-400 hover:bg-neutral-700 transition-colors">
              <Twitter size={18} />
            </a>
          )}
        </div>

        <button
          onClick={() => setIsEditing(true)}
          className="px-4 py-1.5 bg-neutral-800 text-zinc-300 text-xs font-bold rounded-full hover:bg-neutral-700 transition-colors border border-neutral-700 mt-2"
        >
          Edit Profile
        </button>

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
              <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">User Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-black/50 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Bio</label>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    className="w-full bg-black/50 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none transition-colors h-20 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">Instagram ID</label>
                    <input
                      type="text"
                      value={instagram}
                      onChange={e => setInstagram(e.target.value)}
                      placeholder="@username"
                      className="w-full bg-black/50 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">Twitter (@handle)</label>
                    <input
                      type="text"
                      value={twitter}
                      onChange={e => setTwitter(e.target.value)}
                      placeholder="username"
                      className="w-full bg-black/50 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Website URL</label>
                  <input
                    type="url"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-black/50 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50 mt-2"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      <div className="space-y-8 flex-1">

        {/* Personal Collections Section */}
        <PersonalCollections />

        {/* Favorites Section */}
        <section>
          <h2 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
            <Heart size={20} className="text-emerald-500" />
            My Favorites
          </h2>
          <FavoritesList />
        </section>

        {/* My Uploads Section */}
        <section>
          <h2 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
            <Music size={20} className="text-emerald-500" />
            My Contributions
          </h2>
          {uploads.length === 0 ? (
            <div className="text-center py-8 bg-neutral-900/50 rounded-xl border border-dashed border-neutral-800">
              <p className="text-zinc-500 text-sm">You haven't uploaded any ringtones yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(showAllContributions ? uploads : uploads.slice(0, 3)).map(ringtone => (
                <div key={ringtone.id} className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 p-3 rounded-lg group">
                  <div className="w-12 h-12 rounded bg-neutral-800 relative overflow-hidden shrink-0">
                    {ringtone.poster_url ? (
                      <img src={ringtone.poster_url} alt={ringtone.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600"><Music size={16} /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-200 truncate">{ringtone.title}</p>
                    <p className="text-xs text-zinc-500 truncate">{ringtone.movie_name}</p>
                    <p className="text-[10px] text-zinc-600 mt-0.5 capitalize">{ringtone.status}</p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(ringtone.id, e)}
                    className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                    title="Delete Ringtone"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {uploads.length > 3 && (
                <button
                  onClick={() => setShowAllContributions(!showAllContributions)}
                  className="w-full py-3 mt-2 text-xs font-bold uppercase tracking-wider text-zinc-500 bg-neutral-900/50 hover:bg-neutral-800 hover:text-emerald-400 rounded-xl border border-neutral-800 transition-all"
                >
                  {showAllContributions ? 'Show Less' : `View All (${uploads.length})`}
                </button>
              )}
            </div>
          )}
        </section>

        {/* Upload Section */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <h2 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
            Upload Ringtone
          </h2>
          <UploadForm />
        </section>

        {/* Sign Out Section */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div
            onClick={handleSignOut}
            className="p-4 flex items-center justify-between hover:bg-neutral-800/50 transition-colors cursor-pointer text-red-400"
          >
            <div className="flex items-center gap-3">
              <LogOut size={20} />
              <span>Sign Out</span>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-8">
        <hr className="border-neutral-800 mb-8" />
        <LegalFooter />
      </div>
    </div>
  );
}
