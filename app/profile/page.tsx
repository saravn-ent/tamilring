'use client';
// Updated layout - removed Settings, adjusted footer spacing
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import UploadForm from '@/components/UploadForm';
import FavoritesList from '@/components/FavoritesList';
import RingtoneCard from '@/components/RingtoneCard';
import LoginButton from '@/components/LoginButton';
import PersonalCollections from '@/components/PersonalCollections';
import { User, LogOut, Heart, Music, Trash2, Play, Pause, X, Globe, Instagram, Twitter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Ringtone } from '@/types';
import LegalFooter from '@/components/LegalFooter';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [uploads, setUploads] = useState<Ringtone[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
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
      }
      setLoading(false);
    };

    getUser();
  }, [supabase]);

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
    } catch (error) {
      alert('Error updating profile!');
      console.error(error);
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
        <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center mb-4 overflow-hidden border-4 border-neutral-900 shadow-xl relative group">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={40} className="text-zinc-600" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">{profile?.full_name || user.email}</h1>
        {profile?.bio && <p className="text-zinc-400 text-sm max-w-sm text-center mb-4">{profile.bio}</p>}

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
                  <label className="text-xs text-zinc-500 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
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
                    <label className="text-xs text-zinc-500 block mb-1">Instagram (@handle)</label>
                    <input
                      type="text"
                      value={instagram}
                      onChange={e => setInstagram(e.target.value)}
                      placeholder="username"
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
              {uploads.map(ringtone => (
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
