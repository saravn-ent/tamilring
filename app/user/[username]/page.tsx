import { supabase } from '@/lib/supabaseClient';
import { getLevelTitle } from '@/lib/gamification';
import AvatarRank from '@/components/AvatarRank';
import { ArrowLeft, Globe, Instagram, Twitter, User, Music, Trophy, Star, Crown, Zap, Heart, Scissors, Disc } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import RingtoneCard from '@/components/RingtoneCard';
import ShareProfileButton from '@/components/ShareProfileButton';
import SortControl from '@/components/SortControl';
import { Ringtone } from '@/types';

export const revalidate = 60; // Cache for 60 seconds

export default async function UserProfilePage({
  params,
  searchParams
}: {
  params: Promise<{ username: string }>,
  searchParams: Promise<{ sort?: string }>
}) {
  const { username } = await params;
  const { sort } = await searchParams;
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

  // Fetch Uploads with Sorting
  let query = supabase
    .from('ringtones')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'approved');

  // Apply Sorting
  switch (sort) {
    case 'downloads':
      query = query.order('downloads', { ascending: false });
      break;
    case 'likes':
      query = query.order('likes', { ascending: false });
      break;
    case 'year_desc':
      query = query.order('movie_year', { ascending: false });
      break;
    case 'year_asc':
      query = query.order('movie_year', { ascending: true });
      break;
    default: // recent
      query = query.order('created_at', { ascending: false });
  }

  const { data: uploads } = await query;

  // Fetch Badges
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('*, badge:badges(*)')
    .eq('user_id', userId);

  // Calculate Points and Level dynamically to ensure consistency
  // Points logic: 15 points per approved upload
  const calculatedPoints = (uploads?.length || 0) * 15;
  const calculatedLevel = Math.floor(calculatedPoints / 500) + 1;

  // Use calculated values instead of stored ones (which might be stale)
  const level = calculatedLevel;
  const points = calculatedPoints;

  return (
    <div className="max-w-md mx-auto p-4 pb-24 min-h-screen flex flex-col bg-white">

      {/* Social Card */}
      {/* Official Artist Style Profile Card */}
      <div className="bg-white border-b border-zinc-200 -mx-4 px-4 pb-6 mb-6">
        {/* Top Navigation Row (Mimics Artist Header) */}
        <div className="flex items-center justify-between py-2 border-b border-zinc-50 mb-6">
          <Link href="/" className="p-2 -ml-2 text-zinc-400 hover:text-brand-dark transition-colors">
            <ArrowLeft size={18} />
          </Link>

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest leading-none">Contributor</span>
            {uploads && (
              <span className="text-[9px] font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded-full mt-1">
                {uploads.length} {uploads.length === 1 ? 'Ring' : 'Rings'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <ShareProfileButton userId={userId} name={profile.full_name || 'User'} />
          </div>
        </div>

        {/* Profile Info Row */}
        <div className="flex items-center gap-4 px-2">
          {/* Circular Avatar with rank border */}
          <div className="shrink-0">
            <AvatarRank
              image={profile.avatar_url}
              point={points}
              level={level}
              size="md"
            />
          </div>

          {/* Identity & Socials */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-black text-black leading-tight truncate tracking-tight">
                {profile.full_name || 'Anonymous User'}
              </h1>
              <div className="bg-blue-500 rounded-full p-0.5 shrink-0 shadow-sm">
                <Music size={10} className="text-white fill-white" />
              </div>
              <button className="ml-auto p-2 bg-white border border-rose-100 rounded-full text-rose-500 shadow-sm hover:scale-110 transition-transform">
                <Heart size={16} fill="currentColor" className="opacity-80" />
              </button>
            </div>

            {/* Social Handles - Visible and Clickable */}
            <div className="flex items-center gap-3">
              {profile.instagram_handle && (
                <a
                  href={`https://instagram.com/${profile.instagram_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-zinc-400 hover:text-pink-500 flex items-center gap-1 transition-colors"
                >
                  <Instagram size={12} />
                  <span>@{profile.instagram_handle.replace('@', '')}</span>
                </a>
              )}
              {profile.twitter_handle && (
                <a
                  href={`https://twitter.com/${profile.twitter_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-zinc-400 hover:text-blue-500 flex items-center gap-1 transition-colors"
                >
                  <Twitter size={12} />
                  <span>@{profile.twitter_handle.replace('@', '')}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bio Section */}
        {profile.bio && (
          <div className="mt-4 px-2">
            <p className="text-zinc-500 text-xs leading-relaxed max-w-sm">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Badges - Styled as modern tags */}
        {userBadges && userBadges.length > 0 && (
          <div className="mt-5 px-2">
            <div className="flex flex-wrap gap-2">
              {userBadges.map((ub: any) => {
                const Icon = ub.badge?.icon_name === 'scissors' ? Scissors :
                  ub.badge?.icon_name === 'zap' ? Zap :
                    ub.badge?.icon_name === 'crown' ? Crown :
                      ub.badge?.icon_name === 'heart' ? Heart :
                        ub.badge?.icon_name === 'music' ? Disc : Star;

                const getBadgeColor = (name: string) => {
                  switch (name) {
                    case 'crown': return 'bg-amber-50 text-amber-800 border-amber-100';
                    case 'zap': return 'bg-yellow-50 text-yellow-800 border-yellow-100';
                    case 'heart': return 'bg-rose-50 text-rose-600 border-rose-100';
                    case 'scissors': return 'bg-cyan-50 text-cyan-600 border-cyan-100';
                    case 'music': return 'bg-violet-50 text-violet-600 border-violet-100';
                    default: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
                  }
                };

                return (
                  <div key={ub.id} className={`flex items-center gap-1.5 px-3 py-1 rounded-md border text-[9px] font-black uppercase tracking-wider ${getBadgeColor(ub.badge?.icon_name)}`}>
                    <Icon size={10} className="opacity-70" />
                    {ub.badge?.name}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-brand-dark flex items-center gap-2">
            <Music size={20} className="text-brand-accent" />
            Uploaded Ringtones
          </h2>
          <SortControl />
        </div>

        {uploads && uploads.length > 0 ? (
          <div className="space-y-4">
            {uploads.map((ringtone: any) => (
              <RingtoneCard key={ringtone.id} ringtone={ringtone} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-brand-border rounded-2xl bg-brand-wash/30">
            <p className="text-zinc-500 font-medium">No approved ringtones yet.</p>
          </div>
        )}
      </div>

    </div>
  );
}
