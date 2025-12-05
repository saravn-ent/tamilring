'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import UploadForm from '@/components/UploadForm';
import FavoritesList from '@/components/FavoritesList';
import RingtoneCard from '@/components/RingtoneCard';
import LoginButton from '@/components/LoginButton';
import PersonalCollections from '@/components/PersonalCollections';
import { User, LogOut, Heart, Music } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Ringtone } from '@/types';
import LegalFooter from '@/components/LegalFooter';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [uploads, setUploads] = useState<Ringtone[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
        setProfile(profileData);

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setUploads([]);
    router.refresh();
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
      <header className="flex items-center gap-4 py-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-neutral-800 overflow-hidden relative border-2 border-neutral-700">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-emerald-500">
              <User size={32} />
            </div>
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-100">{profile?.full_name || user.email}</h1>
          <p className="text-sm text-zinc-400">{user.email}</p>
        </div>
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
            <div className="grid grid-cols-1 gap-4">
              {uploads.map(ringtone => (
                <RingtoneCard key={ringtone.id} ringtone={ringtone} />
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
