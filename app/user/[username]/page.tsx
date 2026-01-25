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
      {/* Header / Nav */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="p-2.5 bg-brand-wash border border-brand-border rounded-full hover:bg-zinc-100 transition-colors text-brand-dark">
          <ArrowLeft size={20} strokeWidth={2.5} />
        </Link>
        <ShareProfileButton userId={userId} name={profile.full_name || 'User'} />
      </div>

      {/* Social Card */}
      <div className="bg-white border border-brand-border rounded-3xl p-6 flex flex-col items-center text-center shadow-xl shadow-brand-dark/5 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-wash/50 to-transparent pointer-events-none" />

        <div className="mb-4 relative">
          <AvatarRank
            image={profile.avatar_url}
            point={points}
            level={level}
            size="lg"
          />
        </div>

        <h1 className="text-2xl font-black text-brand-dark mb-1 tracking-tight relative">{profile.full_name || 'Anonymous User'}</h1>

        {profile.bio && (
          <p className="text-zinc-500 text-sm mb-5 max-w-xs leading-relaxed relative">
            {profile.bio}
          </p>
        )}

        {/* Badges */}
        {userBadges && userBadges.length > 0 && (
          <div className="mb-6 w-full px-4 relative">
            <div className="flex flex-wrap justify-center gap-3">
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
                      bg: 'from-amber-500 to-amber-600',
                      border: 'border-amber-500',
                      text: 'text-amber-500',
                      hex: '#ffffff',
                      shadow: 'shadow-amber-500/30'
                    };
                    case 'zap': return {
                      bg: 'from-yellow-400 to-yellow-500',
                      border: 'border-yellow-400',
                      text: 'text-yellow-500',
                      hex: '#ffffff',
                      shadow: 'shadow-yellow-400/30'
                    };
                    case 'heart': return {
                      bg: 'from-rose-500 to-rose-600',
                      border: 'border-rose-500',
                      text: 'text-rose-500',
                      hex: '#ffffff',
                      shadow: 'shadow-rose-500/30'
                    };
                    case 'scissors': return {
                      bg: 'from-cyan-400 to-cyan-500',
                      border: 'border-cyan-400',
                      text: 'text-cyan-500',
                      hex: '#ffffff',
                      shadow: 'shadow-cyan-400/30'
                    };
                    case 'music': return {
                      bg: 'from-violet-500 to-violet-600',
                      border: 'border-violet-500',
                      text: 'text-violet-500',
                      hex: '#ffffff',
                      shadow: 'shadow-violet-500/30'
                    };
                    default: return { // Star/Default
                      bg: 'from-emerald-500 to-emerald-600',
                      border: 'border-emerald-500',
                      text: 'text-emerald-500',
                      hex: '#ffffff',
                      shadow: 'shadow-emerald-500/30'
                    };
                  }
                };

                const style = getBadgeColor(ub.badge?.icon_name);

                return (
                  <div key={ub.id} className="relative group cursor-help p-1">
                    {/* Main Badge Container */}
                    <div className={`
                      w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-300 transform group-hover:-translate-y-1 group-hover:scale-105
                      bg-gradient-to-br ${style.bg}
                      ${style.shadow} shadow-lg
                    `}>
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                      <Icon
                        size={24}
                        color={style.hex}
                        fill={style.hex}
                        className={`relative z-10 drop-shadow-sm`}
                      />
                    </div>

                    <div className={`mt-1.5 text-[9px] font-bold uppercase tracking-wider text-center opacity-70 group-hover:opacity-100 transition-opacity ${style.text}`}>
                      {ub.badge?.name}
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-white p-3 rounded-xl text-xs text-center border border-brand-border opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 shadow-xl shadow-black/5 translate-y-2 group-hover:translate-y-0">
                      <p className={`font-bold text-sm mb-1 ${style.text}`}>{ub.badge?.name}</p>
                      <p className="text-zinc-500 leading-relaxed">{ub.badge?.description}</p>
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-brand-border rotate-45"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Social Links */}
        <div className="flex items-center gap-3 relative">
          {profile.website_url && (
            <a href={profile.website_url} target="_blank" rel="noreferrer" className="p-2.5 bg-brand-wash rounded-full text-zinc-500 hover:text-brand-accent hover:bg-brand-wash/80 transition-colors border border-transparent hover:border-brand-border">
              <Globe size={18} />
            </a>
          )}
          {profile.instagram_handle && (
            <a href={`https://instagram.com/${profile.instagram_handle.replace('@', '')}`} target="_blank" rel="noreferrer" className="p-2.5 bg-brand-wash rounded-full text-zinc-500 hover:text-pink-500 hover:bg-brand-wash/80 transition-colors border border-transparent hover:border-brand-border">
              <Instagram size={18} />
            </a>
          )}
          {profile.twitter_handle && (
            <a href={`https://twitter.com/${profile.twitter_handle.replace('@', '')}`} target="_blank" rel="noreferrer" className="p-2.5 bg-brand-wash rounded-full text-zinc-500 hover:text-blue-500 hover:bg-brand-wash/80 transition-colors border border-transparent hover:border-brand-border">
              <Twitter size={18} />
            </a>
          )}
        </div>
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
