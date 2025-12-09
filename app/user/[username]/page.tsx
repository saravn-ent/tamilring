import { supabase } from '@/lib/supabaseClient';
import { getLevelTitle } from '@/lib/gamification';
import AvatarRank from '@/components/AvatarRank';
import { ArrowLeft, Globe, Instagram, Twitter, User, Music, Trophy, Star, Crown, Zap, Heart, Scissors, Disc } from 'lucide-react';
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

  // Fetch Badges
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('*, badge:badges(*)')
    .eq('user_id', userId);

  const level = profile.level || 1;
  const points = profile.points || 0;

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

        <div className="mb-4">
          <AvatarRank
            image={profile.avatar_url}
            point={points}
            level={level}
            size="lg"
          />
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
            <span className="font-bold text-white text-xl">{uploads?.length || 0}</span>
            <span className="text-zinc-500 font-medium text-[10px] uppercase tracking-wider">Ringtones</span>
          </div>
          <div className="w-px h-8 bg-neutral-800" />
          <div className="flex flex-col items-center">
            <span className="font-bold text-emerald-500 text-xl">{points}</span>
            <span className="text-zinc-500 font-medium text-[10px] uppercase tracking-wider">Reputation</span>
          </div>
          <div className="w-px h-8 bg-neutral-800" />
          <div className="flex flex-col items-center">
            <span className="font-bold text-amber-500 text-xl">{getLevelTitle(level)}</span>
            <span className="text-zinc-500 font-medium text-[10px] uppercase tracking-wider">Level</span>
          </div>
        </div>

        {/* Badges */}
        {userBadges && userBadges.length > 0 && (
          <div className="mb-6 w-full px-4">
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
