import React from 'react';
import SectionHeader from '@/components/SectionHeader';
import HeroCard from '@/components/HeroCard';
import { supabase } from '@/lib/supabaseClient';
import { unstable_cache } from 'next/cache';
import { searchPerson, getImageUrl } from '@/lib/tmdb';
import { getUserLanguage } from '@/app/actions/ringtones';

const getTopFemaleSingers = unstable_cache(
    async (lang: string) => {
        // 1. Fetch ALL singers from Female-tagged ringtones filtered by language
        let query = supabase
            .from('ringtones')
            .select('singers')
            .eq('status', 'approved')
            .contains('tags', ['Female']);

        if (lang === 'tamil') {
            query = query.or('language.eq.tamil,language.is.null'); // Include legacy nulls as tamil
        } else {
            query = query.eq('language', lang);
        }

        let { data: femaleRingtones } = await query;

        // Fallback: If no results for requested lang, try tamil
        if ((!femaleRingtones || femaleRingtones.length === 0) && lang !== 'tamil') {
            const { data: fallback } = await supabase
                .from('ringtones')
                .select('singers')
                .eq('status', 'approved')
                .contains('tags', ['Female'])
                .or('language.eq.tamil,language.is.null');
            femaleRingtones = fallback;
        }

        if (!femaleRingtones) return [];

        // 2. Aggregate counts for ALL singers found in these female-tagged songs
        const singerCounts: Record<string, number> = {};
        femaleRingtones.forEach(r => {
            if (!r.singers) return;
            // Clean up names (basic splitting by comma/ampersand)
            const names = r.singers.split(/,|&|feat\.|ft\./i).map((n: string) => n.trim()).filter(Boolean);
            names.forEach((name: string) => {
                // Remove brackets like (Singer) or [Singer]
                const cleanName = name.replace(/\(.*\)|\[.*\]/g, '').trim();
                if (cleanName.length > 2) { // Filter out initials or short noise
                    singerCounts[cleanName] = (singerCounts[cleanName] || 0) + 1;
                }
            });
        });

        // 3. Sort by popularity (frequency)
        const sortedNames = Object.entries(singerCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 40) // Take top 40 candidates to verify gender (widened from 20)
            .map(entry => entry[0]);

        // 4. Enrich with TMDB images AND Verify Gender
        // We only want verified FEMALE artists (Gender = 1 in TMDB)
        const enriched = await Promise.all(sortedNames.map(async (name) => {
            const person = await searchPerson(name);

            // Gender check: 1 = Female, 2 = Male, 0 = Unknown
            const isFemale = person?.gender === 1; // Strictly female if known
            const isUnknown = person?.gender === 0 || !person; // Unknown or not in TMDB
            const isManualOverride = person?.id === 0;

            // If we KNOW they are male, skip them entirely
            if (person?.gender === 2) return null;

            if (person?.profile_path && (isFemale || isManualOverride)) {
                return {
                    name: person.name || name,
                    image: getImageUrl(person.profile_path, 'w185')
                };
            }

            // FALLBACK: Return name only if not verified as male
            // This allows local artists not in TMDB to show up if tagged 'Female'
            return {
                name: name,
                image: ''
            };
        }));

        // Filter out nulls (verified males)
        const validFemaleSingers = enriched.filter(p => p !== null) as { name: string, image: string }[];

        // Return top 8
        return validFemaleSingers.slice(0, 8);
    },
    ['top-female-singers-v9'], // Updated cache key
    { revalidate: 3600, tags: ['homepage-artists'] }
);

export default async function HomeFemaleSingers() {
    const lang = await getUserLanguage();
    const topFemaleSingers = await getTopFemaleSingers(lang);
    console.log('HomeFemaleSingers: lang =', lang, 'count =', topFemaleSingers?.length || 0);

    if (!topFemaleSingers || topFemaleSingers.length === 0) return null;

    return (
        <div className="mb-10">
            <div className="px-4 text-center mb-6">
                <SectionHeader title="Popular Female Singers" translationKey="femaleSinger" />
            </div>
            <div className="flex overflow-x-auto px-4 pb-8 scrollbar-hide snap-x pt-2 pl-6 md:grid md:grid-cols-4 lg:grid-cols-8 md:gap-6 md:px-0 md:pl-0 md:overflow-visible">
                {topFemaleSingers.map((singer, idx) => (
                    <HeroCard
                        key={idx}
                        index={idx}
                        name={singer.name}
                        image={singer.image}
                        href={`/artist/${encodeURIComponent(singer.name)}`}
                        priority={idx < 4}
                        className="md:w-full md:h-auto md:aspect-[2/3]"
                    />
                ))}
            </div>
        </div>
    );
}
