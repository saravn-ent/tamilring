import React from 'react';
import SectionHeader from '@/components/SectionHeader';
import Link from 'next/link';
import TMDBImage from '@/components/TMDBImage';
import { supabase } from '@/lib/supabaseClient';
import { unstable_cache } from 'next/cache';
import { headers } from 'next/headers';

const getNostalgiaRingtones = unstable_cache(
    async (lang: string = 'tamil') => {
        let query = supabase
            .from('ringtones')
            .select('*')
            .eq('status', 'approved')
            .lt('movie_year', 2015)
            .order('likes', { ascending: false })
            .limit(10);

        if (lang === 'tamil') {
            query = query.or(`language.eq.${lang},language.is.null`);
        } else {
            query = query.eq('language', lang);
        }

        const { data: ringtones } = await query;
        if (!ringtones || ringtones.length === 0) return [];

        const userIds = Array.from(new Set(ringtones.map(r => r.user_id).filter(Boolean)));
        if (userIds.length === 0) return ringtones;

        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]));
        return ringtones.map(r => ({ ...r, profile: profileMap.get(r.user_id) }));

    },
    ['nostalgia-ringtones-v2'],
    { revalidate: 3600, tags: ['nostalgia'] }
);

async function getCurrentLang() {
    const head = await headers();
    const lang = head.get('x-user-language') || 'ta';
    return lang === 'ta' ? 'tamil' : 'english';
}

export default async function HomeNostalgia() {
    const lang = await getCurrentLang();
    const nostalgia = await getNostalgiaRingtones(lang);

    if (!nostalgia || nostalgia.length === 0) return null;

    return (
        <div className="mb-10">
            <div className="px-4">
                <SectionHeader title="Rewind: Memories" translationKey="memories" />
                <p className="text-xs text-zinc-500 mb-3 -mt-2">Rings that bring back the good times</p>
            </div>
            <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 md:overflow-visible">
                {nostalgia.map(ringtone => (
                    <Link key={ringtone.id} href={`/ringtone/${ringtone.slug}`} className="snap-start shrink-0 w-32 sm:w-36 md:w-full group">
                        <div className="relative w-32 sm:w-36 md:w-full h-44 sm:h-48 md:h-auto md:aspect-[2/3] rounded-xl overflow-hidden mb-2 bg-brand-wash shadow-lg group-hover:shadow-brand-accent/10 transition-all">
                            <TMDBImage
                                path={ringtone.poster_url}
                                alt={ringtone.title}
                                fill
                                sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 16vw"
                                quality={75}
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80" />
                            <div className="absolute bottom-2 right-2 bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-white font-medium backdrop-blur-sm">
                                {ringtone.movie_year}
                            </div>
                        </div>
                        <p className="text-xs font-bold text-black truncate group-hover:text-brand-accent transition-colors">{ringtone.title}</p>
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
