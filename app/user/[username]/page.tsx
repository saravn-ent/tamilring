import { supabase } from '@/lib/supabaseClient';
import AvatarRank from '@/components/AvatarRank';
import { ArrowLeft, Instagram, Twitter, Music, Star, Crown, Zap, Heart, Scissors, Disc } from 'lucide-react';
import Link from 'next/link';
import RingtoneCard from '@/components/RingtoneCard';
import ShareProfileButton from '@/components/ShareProfileButton';
import SortControl from '@/components/SortControl';
import type { Ringtone, UserBadge } from '@/types';

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
    <div className="max-w-md mx-auto p-4 pb-24 min-h-screen flex flex-col">

      {/* Social Card */}
      {/* Official Artist Style Profile Card */}
      <div className="bg-m3-surface-container-low border border-m3-outline-variant/30 rounded-3xl -mx-2 sm:mx-0 p-4 pb-6 mb-6 shadow-sm">
        {/* Top Navigation Row (Mimics Artist Header) */}
        <div className="flex items-center justify-between py-2 border-b border-m3-outline-variant/20 mb-6">
          <Link href="/" className="p-2 -ml-2 text-m3-outline hover:text-m3-on-surface transition-colors">
            <ArrowLeft size={18} />
          </Link>

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-m3-primary uppercase tracking-widest leading-none">Contributor</span>
            {uploads && (
              <span className="text-[9px] font-bold text-m3-on-surface-variant bg-m3-surface-container px-2 py-0.5 rounded-full mt-1 border border-m3-outline-variant/30">
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
              <h1 className="text-xl font-display font-black text-m3-on-surface leading-tight truncate tracking-tight">
                {profile.full_name || 'Anonymous User'}
              </h1>
              <div className="bg-blue-500 rounded-full p-0.5 shrink-0 shadow-sm">
                <Music size={10} className="text-white fill-white" />
              </div>
              <button className="ml-auto p-2 bg-m3-surface-container border border-m3-outline-variant/30 rounded-full text-rose-500 shadow-sm hover:scale-110 transition-transform">
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
                  className="text-[11px] font-bold text-m3-outline hover:text-pink-500 flex items-center gap-1 transition-colors"
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
                  className="text-[11px] font-bold text-m3-outline hover:text-blue-500 flex items-center gap-1 transition-colors"
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
            <p className="text-m3-on-surface-variant text-xs leading-relaxed max-w-sm">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Badges - Styled as modern tags */}
        {userBadges && userBadges.length > 0 && (
          <div className="mt-5 px-2">
            <div className="flex flex-wrap gap-2">
              {userBadges.map((ub: UserBadge) => {
                const Icon = ub.badge?.icon_name === 'scissors' ? Scissors :
                  ub.badge?.icon_name === 'zap' ? Zap :
                    ub.badge?.icon_name === 'crown' ? Crown :
                      ub.badge?.icon_name === 'heart' ? Heart :
                        ub.badge?.icon_name === 'music' ? Disc : Star;

                const getBadgeColor = (name: string) => {
                  switch (name) {
                    case 'crown': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
                    case 'zap': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
                    case 'heart': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
                    case 'scissors': return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
                    case 'music': return 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20';
                    default: return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
                  }
                };

                return (
                  <div key={ub.id} className={`flex items-center gap-1.5 px-3 py-1 rounded-md border text-[9px] font-black uppercase tracking-wider ${getBadgeColor(ub.badge?.icon_name || '')}`}>
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
          <h2 className="text-lg font-bold text-m3-on-surface flex items-center gap-2">
            <Music size={20} className="text-m3-primary" />
            Uploaded Ringtones
          </h2>
          <SortControl />
        </div>

        {uploads && uploads.length > 0 ? (
          <div className="space-y-4">
            {uploads.map((ringtone: Ringtone) => (
              <RingtoneCard key={ringtone.id} ringtone={ringtone} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-m3-outline-variant/40 rounded-2xl bg-m3-surface-container-low">
            <p className="text-m3-on-surface-variant font-medium">No approved ringtones yet.</p>
          </div>
        )}
      </div>

    </div>
  );
}
