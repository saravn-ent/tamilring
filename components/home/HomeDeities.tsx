import React from 'react';
import SectionHeader from '@/components/SectionHeader';
import HeroCard from '@/components/HeroCard';
import { supabase } from '@/lib/supabaseClient';
import { unstable_cache } from 'next/cache';
import Link from 'next/link';
import Image from 'next/image';

import { DEITY_CATEGORIES } from '@/lib/constants';

// Fetch top deities using client-side aggregation for now to avoid migration dependency
const getTopDeities = unstable_cache(
    async () => {
        // Flatten known deities for validation
        const allowedDeities = Object.values(DEITY_CATEGORIES).flat().map(d => d.toLowerCase());

        // 1. Fetch Custom Deity Images
        const { data: customImages } = await supabase
            .from('deity_images')
            .select('deity_name, image_url');

        const customImageMap = new Map<string, string>();
        if (customImages) {
            customImages.forEach(img => {
                if (img.deity_name && img.image_url) {
                    customImageMap.set(img.deity_name.toLowerCase(), img.image_url);
                }
            });
        }

        // 2. Fetch necessary fields for all devotional ringtones
        const { data: ringtones, error } = await supabase
            .from('ringtones')
            .select('movie_name, likes, poster_url, id, tags')
            .eq('status', 'approved')
            .or('tags.cs.{"Devotional"}') // More robust contains check
            .not('movie_name', 'is', null)
            .order('likes', { ascending: false });

        if (error || !ringtones) {
            console.error('Error fetching deities:', error);
            return [];
        }

        // Aggregate by movie_name (which holds Deity name for Devotional songs)
        const deityMap = new Map<string, {
            name: string;
            total_likes: number;
            count: number;
            poster_url: string | null;
        }>();

        ringtones.forEach(r => {
            const name = r.movie_name?.trim();
            if (!name) return;
            const lowerName = name.toLowerCase();

            // Relaxed Filter: Allow known deities OR simply any Devotional tagged ringtone
            // This ensures the section shows up locally even if we don't have 'official' deity names
            const hasDevotionalTag = r.tags && r.tags.includes('Devotional');

            const isKnown = allowedDeities.includes(lowerName) ||
                allowedDeities.some(d => lowerName.includes(d) && d.length > 4) ||
                hasDevotionalTag; // Allow by tag

            if (!isKnown) {
                return;
            }

            if (!deityMap.has(lowerName)) {
                // Check if we have a custom image for this deity
                const customUrl = customImageMap.get(lowerName);

                deityMap.set(lowerName, {
                    name, // Keep original casing from first encounter or lookup? Original from ringtone is fine usually.
                    total_likes: 0,
                    count: 0,
                    poster_url: customUrl || null
                });
            }

            const entry = deityMap.get(lowerName)!;
            entry.total_likes += (r.likes || 0);
            entry.count += 1;

            // Fallback: Use ringtone poster if no custom image is set and we don't have one yet
            if (!entry.poster_url && r.poster_url) {
                entry.poster_url = r.poster_url;
            }
        });

        // Convert to array and sort
        const topDeities = Array.from(deityMap.values())
            .sort((a, b) => b.total_likes - a.total_likes)
            .slice(0, 10); // Top 10

        return topDeities;
    },
    ['top-deities-home-v6'], // Bump cache version
    { revalidate: 60, tags: ['homepage-deities'] } // Lower revalidate time to see changes faster
);

export default async function HomeDeities() {
    const topDeities = await getTopDeities();
    console.log('HomeDeities: count =', topDeities?.length || 0);

    if (!topDeities || topDeities.length === 0) return null;

    return (
        <div className="mb-10">
            <div className="px-4 text-center mb-6">
                <SectionHeader title="Gods/Deity" />
            </div>
            <div className="flex gap-4 overflow-x-auto px-4 pb-8 scrollbar-hide snap-x pt-2 pl-4 md:grid md:grid-cols-6 lg:grid-cols-8 md:overflow-visible md:justify-items-center">
                {topDeities.map((deity, idx) => (
                    <Link
                        key={idx}
                        href={`/devotional/${encodeURIComponent(deity.name)}`}
                        className="snap-start shrink-0 flex flex-col items-center gap-2 w-24 group md:w-full"
                    >
                        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-md group-hover:shadow-lg transition-all group-hover:scale-105 duration-300 border-2 border-white ring-2 ring-indigo-50">
                            {deity.poster_url ? (
                                <Image
                                    src={deity.poster_url}
                                    alt={deity.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 80px, 96px"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                                    <span className="text-2xl">🕉️</span>
                                </div>
                            )}
                        </div>
                        <div className="text-center w-full mt-1">
                            <p className="text-xs font-bold text-slate-900 truncate w-full px-1 group-hover:text-indigo-700 transition-colors">
                                {deity.name}
                            </p>
                            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                                {deity.count} Songs
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
