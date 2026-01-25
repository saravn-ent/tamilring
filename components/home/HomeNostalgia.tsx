import React from 'react';
import SectionHeader from '@/components/SectionHeader';
import Link from 'next/link';
import TMDBImage from '@/components/TMDBImage';
import { supabase } from '@/lib/supabaseClient';
import { unstable_cache } from 'next/cache';

const getNostalgiaRingtones = unstable_cache(
    async () => {
        const { data } = await supabase.from('ringtones').select('*').eq('status', 'approved').lt('movie_year', '2015').order('likes', { ascending: false }).limit(10);
        return data || [];
    },
    ['nostalgia-ringtones-v1'],
    { revalidate: 3600, tags: ['nostalgia'] }
);

export default async function HomeNostalgia() {
    const nostalgia = await getNostalgiaRingtones();

    if (!nostalgia || nostalgia.length === 0) return null;

    return (
        <div className="mb-10">
            <div className="px-4">
                <SectionHeader title="Rewind: Memories" translationKey="memories" />
                <p className="text-xs text-zinc-500 mb-3 -mt-2">Rings that bring back the good times</p>
            </div>
            <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x">
                {nostalgia.map(ringtone => (
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
                            <div className="absolute bottom-2 right-2 bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-white font-medium backdrop-blur-sm">
                                {ringtone.movie_year}
                            </div>
                        </div>
                        <p className="text-xs font-bold text-black truncate group-hover:text-brand-accent transition-colors">{ringtone.title}</p>
                        <p className="text-[10px] text-brand-dark truncate">{ringtone.movie_name}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
