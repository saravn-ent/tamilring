import React from 'react';
import SectionHeader from '@/components/SectionHeader';
import { supabase } from '@/lib/supabaseClient';
import { unstable_cache } from 'next/cache';
import Link from 'next/link';
import Image from 'next/image';
import { DEITY_CATEGORIES } from '@/lib/constants';
import StructuredData from '@/components/StructuredData';
import { generateCollectionItemListSchema } from '@/lib/seo';

// Fetch top deities using client-side aggregation for now to avoid migration dependency
const getTopDeities = unstable_cache(
    async (lang: string = 'tamil') => {
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
        let query = supabase
            .from('ringtones')
            .select('movie_name, likes, poster_url, id, tags, language')
            .eq('status', 'approved')
            .or('tags.cs.{"Devotional"}') // More robust contains check
            .not('movie_name', 'is', null);

        if (lang === 'tamil') {
            query = query.or(`language.eq.${lang},language.is.null`);
        } else {
            query = query.eq('language', lang);
        }

        const { data: fetchResult, error } = await query.order('likes', { ascending: false });
        let ringtones = fetchResult;

        // Fallback to Tamil for Deities if no regional matches
        if ((!ringtones || ringtones.length === 0) && lang !== 'tamil') {
            const { data: fallback } = await supabase
                .from('ringtones')
                .select('movie_name, likes, poster_url, id, tags, language')
                .eq('status', 'approved')
                .or('tags.cs.{"Devotional"}')
                .or('language.eq.tamil,language.is.null')
                .not('movie_name', 'is', null)
                .order('likes', { ascending: false });
            ringtones = fallback;
        }

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

            // Find the matched deity name (word-boundary match)
            // Group ALL songs by the DEITY they match, not by their raw movie_name.
            // This means "Thank You Allah", "Allahi Allah Kiya Karo" etc. all group under "Allah".
            const words = lowerName.split(/[^a-z0-9]+/).filter((w: string) => w.length > 0);

            let matchedDeity: string | null = null;
            for (const d of allowedDeities) {
                const ld = d.toLowerCase();
                // Require the deity name to appear as a whole word in the movie_name
                if (words.includes(ld) || lowerName === ld) {
                    // Find the original-case deity name from DEITY_CATEGORIES
                    const originalCase = Object.values(DEITY_CATEGORIES).flat().find(
                        dc => dc.toLowerCase() === ld
                    ) || d;
                    matchedDeity = originalCase;
                    break;
                }
            }

            if (!matchedDeity) return;

            const deityKey = matchedDeity.toLowerCase();

            if (!deityMap.has(deityKey)) {
                // Check if we have a custom image for this deity
                const customUrl = customImageMap.get(deityKey);

                deityMap.set(deityKey, {
                    name: matchedDeity,
                    total_likes: 0,
                    count: 0,
                    poster_url: customUrl || null
                });
            }

            const entry = deityMap.get(deityKey)!;
            entry.total_likes += (r.likes || 0);
            entry.count += 1;

            // Fallback: Use ringtone poster if no custom image is set
            if (!entry.poster_url && r.poster_url) {
                entry.poster_url = r.poster_url;
            }
        });

        return Array.from(deityMap.values())
            .sort((a, b) => b.total_likes - a.total_likes)
            .slice(0, 10);
    },
    ['top-deities-home-v10'], // Bump cache version after DB resume
    { revalidate: 3600, tags: ['homepage-deities'] }
);

export default async function HomeDeities({ lang }: { lang: string }) {
    const topDeities = await getTopDeities(lang);
    console.log('HomeDeities: count =', topDeities?.length || 0);

    if (!topDeities || topDeities.length === 0) return null;

    const deityItemListSchema = generateCollectionItemListSchema({
        name: 'Bhakthi & Spiritual — Tamil Devotional Ringtone Collections',
        description: 'Sacred Tamil devotional ringtones and chants for Hindu, Christian, and Islamic deities.',
        items: topDeities.map(d => ({
            name: `${d.name} Tamil Ringtones`,
            description: `Download ${d.name} devotional songs, chants, and spiritual ringtones (${d.count} songs).`,
            url: `/devotional/${encodeURIComponent(d.name)}`,
            image: d.poster_url || undefined,
        })),
    });

    return (
        <div className="mb-8">
            <StructuredData data={deityItemListSchema} />
            <div className="px-3 sm:px-4">
                <SectionHeader
                    title="Bhakthi & Devotional"
                    subtitle="Spiritual & Divine"
                    translationKey="deities"
                    href="/mood/Devotional"
                />
            </div>
            <div className="flex gap-3 overflow-x-auto px-3 sm:px-4 pb-3 scrollbar-hide snap-x pt-1 md:grid md:grid-cols-6 lg:grid-cols-8 md:overflow-visible md:justify-items-center">
                {topDeities.map((deity, idx) => (
                    <Link
                        key={idx}
                        href={`/devotional/${encodeURIComponent(deity.name)}`}
                        prefetch={false}
                        className="snap-start shrink-0 flex flex-col items-center gap-1.5 w-[72px] sm:w-20 group md:w-full"
                    >
                        <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden shadow-2xs group-hover:shadow-md transition-all group-hover:scale-105 duration-300 border-2 border-m3-surface ring-2 ring-m3-outline-variant/40 group-hover:ring-m3-primary bg-m3-surface-container">
                            {deity.poster_url ? (
                                <Image
                                    src={deity.poster_url}
                                    alt={deity.name}
                                    fill
                                    className="object-cover"
                                    sizes="72px"
                                    loading="lazy"
                                    fetchPriority="low"
                                />
                            ) : (
                                <div className="w-full h-full bg-m3-primary-container text-m3-on-primary-container flex items-center justify-center">
                                    <span className="text-xl">🕉️</span>
                                </div>
                            )}
                        </div>
                        <div className="text-center w-full">
                            <p className="text-[11px] font-bold text-m3-on-surface truncate w-full px-0.5 group-hover:text-m3-primary transition-colors">
                                {deity.name}
                            </p>
                            <span className="text-[9px] text-m3-on-surface-variant font-medium block mt-0.2">
                                {deity.count} Songs
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
