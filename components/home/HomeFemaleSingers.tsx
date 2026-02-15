import React from 'react';
import SectionHeader from '@/components/SectionHeader';
import HeroCard from '@/components/HeroCard';
import { supabase } from '@/lib/supabaseClient';
import { unstable_cache } from 'next/cache';
import { searchPerson, getImageUrl } from '@/lib/tmdb';
import { getUserLanguage } from '@/app/actions/ringtones';
import { TOP_FEMALE_SINGERS_BY_LANGUAGE } from '@/lib/constants';

const getTopFemaleSingers = unstable_cache(
    async (lang: string) => {
        const regionalFemaleSingers = TOP_FEMALE_SINGERS_BY_LANGUAGE[lang] || [];

        // Enrich with TMDB images
        const enriched = await Promise.all(regionalFemaleSingers.map(async (name) => {
            const person = await searchPerson(name);

            if (person?.profile_path) {
                return {
                    name: person.name || name,
                    image: getImageUrl(person.profile_path, 'w185')
                };
            }

            return {
                name: name,
                image: ''
            };
        }));

        return enriched;
    },
    ['top-female-singers-v11'], // Updated version
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
                <SectionHeader title="Popular Female Singers" />
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
                        className="md:w-full md:h-auto md:aspect-2/3"
                    />
                ))}
            </div>
        </div>
    );
}
