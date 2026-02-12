import React from 'react';
import SectionHeader from '@/components/SectionHeader';
import Link from 'next/link';
import AvatarRank from '@/components/AvatarRank';
import { supabase } from '@/lib/supabaseClient';
import { unstable_cache } from 'next/cache';
import { getLevelTitle } from '@/lib/gamification';

const getTopContributorsList = unstable_cache(
    async () => {
        const { data, error } = await supabase.rpc('get_top_contributors', { limit_count: 10 });
        if (error) {
            console.error('Error fetching top contributors:', JSON.stringify(error, null, 2));
            return [];
        }
        return data || [];
    },
    ['top-contributors-v1'],
    { revalidate: 3600, tags: ['contributors'] }
);

interface Contributor {
    id: string;
    name: string;
    image: string | null;
    count: number;
    points: number;
    title: string;
    level: number;
}

export default async function HomeContributors() {
    const topContributorsRaw = await getTopContributorsList();

    if (!topContributorsRaw || topContributorsRaw.length === 0) return null;

    const topContributors: Contributor[] = topContributorsRaw.map((c: any) => ({
        id: c.user_id,
        // Prefer Social Handle (without @), then Full Name
        name: (c.instagram_handle || c.twitter_handle || '').replace('@', '') || c.full_name || 'Ringtone User',
        image: c.avatar_url,
        count: c.upload_count,
        points: c.points,
        title: getLevelTitle(c.level),
        level: c.level
    }));

    return (
        <div className="mb-14 px-4">
            <SectionHeader title="Top Contributors" translationKey="contributors" />
            <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x pt-2">
                {topContributors.map((c: Contributor, idx: number) => (
                    <Link key={c.id} href={`/user/${encodeURIComponent(c.id)}`} className="snap-start shrink-0 flex flex-col items-center gap-3 w-24 group">
                        <div className="relative">
                            <AvatarRank
                                image={c.image}
                                point={c.points}
                                level={c.level || 1}
                                size="md"
                            />
                            {/* Ring Count Badge Overlay */}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-brand-dark text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-white shadow-sm whitespace-nowrap z-10">
                                {c.count} Rings
                            </div>
                        </div>
                        <div className="text-center w-full mt-3 flex flex-col items-center">
                            <p className="text-xs font-bold text-foreground truncate w-full">
                                {c.name.includes(' ') && !c.name.includes('.') ? c.name.split(' ')[0] : c.name}
                            </p>
                            <span className="text-[10px] text-amber-600 font-bold mt-1">{c.title}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
