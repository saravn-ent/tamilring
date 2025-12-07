import { createClient } from '@/lib/supabaseClient';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, Globe, Instagram, Twitter, User, Music } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import RingtoneCard from '@/components/RingtoneCard';
import ShareProfileButton from '@/components/ShareProfileButton';

export const revalidate = 60; // Cache for 60 seconds

export default async function UserProfilePage({
  params
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params;
  const userId = decodeURIComponent(username);

  // Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500">
        User not found.
      </div>
    );
  }

  // Fetch Uploads
  const { data: uploads } = await supabase
    .from('ringtones')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-md mx-auto p-4 pb-24 min-h-screen flex flex-col">
      {/* Header / Nav */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <ShareProfileButton userId={userId} name={profile.full_name || 'User'} />
      </div>

      {/* Social Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col items-center text-center shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />

        <div className="w-24 h-24 rounded-full bg-neutral-800 border-4 border-neutral-900 overflow-hidden relative shadow-lg mb-4">
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt={profile.full_name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600">
              <User size={40} />
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">{profile.full_name || 'Anonymous User'}</h1>

        {profile.bio && (
          <p className="text-zinc-400 text-sm mb-4 max-w-xs leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-6 mb-6 text-sm">
          <div className="flex flex-col items-center">
            <span className="font-bold text-white">{uploads?.length || 0}</span>
            <span className="text-zinc-500 font-medium text-xs uppercase tracking-wider">Ringtones</span>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-3">
          {profile.website_url && (
            <a href={profile.website_url} target="_blank" rel="noreferrer" className="p-2.5 bg-neutral-800 rounded-full text-zinc-400 hover:text-emerald-400 hover:bg-neutral-700 transition-colors">
              <Globe size={18} />
            </a>
          )}
          {profile.instagram_handle && (
            <a href={`https://instagram.com/${profile.instagram_handle.replace('@', '')}`} target="_blank" rel="noreferrer" className="p-2.5 bg-neutral-800 rounded-full text-zinc-400 hover:text-pink-500 hover:bg-neutral-700 transition-colors">
              <Instagram size={18} />
            </a>
          )}
          {profile.twitter_handle && (
            <a href={`https://twitter.com/${profile.twitter_handle.replace('@', '')}`} target="_blank" rel="noreferrer" className="p-2.5 bg-neutral-800 rounded-full text-zinc-400 hover:text-blue-400 hover:bg-neutral-700 transition-colors">
              <Twitter size={18} />
            </a>
          )}
        </div>
      </div>

      {/* Ringtones List */}
      <div>
        <h2 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
          <Music size={20} className="text-emerald-500" />
          Uploaded Ringtones
        </h2>

        {uploads && uploads.length > 0 ? (
          <div className="space-y-4">
            {uploads.map((ringtone: any) => (
              <RingtoneCard key={ringtone.id} ringtone={ringtone} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-neutral-800 rounded-xl">
            <p className="text-zinc-500">No approved ringtones yet.</p>
          </div>
        )}
      </div>

    </div>
  );
}
