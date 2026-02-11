import React from 'react';
import SectionHeader from '@/components/SectionHeader';
import Link from 'next/link';
import TMDBImage from '@/components/TMDBImage';
import { getTrendingRingtones, getUserLanguage } from '@/app/actions/ringtones';
import { Ringtone } from '@/types';

import { supabase } from '@/lib/supabaseClient';

export default async function HomeTrending() {
    const lang = await getUserLanguage();
    let trending = await getTrendingRingtones(10, lang);

    if (!trending || trending.length === 0) return null;

    // Fetch Profiles manually for attribution
    const userIds = Array.from(new Set(trending.map((r: any) => r.user_id).filter(Boolean)));
    if (userIds.length > 0) {
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds);

        const profileMap = new Map(profiles?.map((p: any) => [p.id, p]));
        trending = trending.map((r: any) => ({ ...r, profile: profileMap.get(r.user_id) }));
    }

    return (
        <div className="mb-10">
            <div className="px-4">
                <SectionHeader title="Trending Ringtones" translationKey="trending" />
            </div>
            <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x">
                {trending.map((ringtone: Ringtone) => (
                    <Link key={ringtone.id} href={`/ringtone/${ringtone.slug}`} className="snap-start shrink-0 w-32 sm:w-36 md:w-40 group">
                        <div className="relative w-32 sm:w-36 md:w-40 h-44 sm:h-48 md:h-56 rounded-xl overflow-hidden mb-2 bg-brand-wash shadow-lg group-hover:shadow-brand-accent/10 transition-all">
                            <TMDBImage
                                path={ringtone.poster_url}
                                alt={ringtone.title}
                                fill
                                sizes="(max-width: 768px) 33vw, 128px"
                                quality={75}
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80" />
                        </div>
                        <p className="text-xs font-bold text-black truncate group-hover:text-brand-blue transition-colors">{ringtone.title}</p>
                        <p className="text-[10px] text-brand-dark truncate">{ringtone.movie_name}</p>
                        {ringtone.profile?.full_name && (
                            <p className="text-[9px] text-zinc-500 truncate mt-0.5">by {ringtone.profile.full_name}</p>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
}
