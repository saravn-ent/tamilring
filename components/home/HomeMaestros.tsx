import React from 'react';
import SectionHeader from '@/components/SectionHeader';
import { getTopArtists } from '@/components/home/HomeTopArtists';
import Link from 'next/link';
import ImageWithFallback from '@/components/ImageWithFallback';
import StructuredData from '@/components/StructuredData';
import { generateArtistItemListSchema } from '@/lib/seo';

interface Props {
    lang: string;
}

// Cultural honorary epithets for Tamil composers
const MAESTRO_TITLES: Record<string, string> = {
    'ilaiyaraaja': 'Isaignani • The Maestro',
    'ilayaraja': 'Isaignani • The Maestro',
    'a.r. rahman': 'Isai Puyal • Oscar Winner',
    'ar rahman': 'Isai Puyal • Oscar Winner',
    'anirudh': 'Rockstar • Modern Anthem',
    'anirudh ravichander': 'Rockstar • Modern Anthem',
    'yuvan shankar raja': 'BGM King • Youth Icon',
    'harris jayaraj': 'Melody Wizard',
    'vidyasagar': 'Melody Maker',
    'santhosh narayanan': 'Sonic Maverick',
    'deva': 'Gaana Legend',
    'g.v. prakash kumar': 'Melody & Mass',
    'gv prakash': 'Melody & Mass',
    'd. imman': 'Folk & Symphony',
    'imman': 'Folk & Symphony',
};

export default async function HomeMaestros({ lang }: Props) {
    const { topMusicDirectors } = await getTopArtists(lang);

    if (!topMusicDirectors || topMusicDirectors.length === 0) return null;

    const artistItemListSchema = generateArtistItemListSchema({
        name: 'Hall of Maestros — Top Tamil Music Directors',
        description: 'Legendary and trending Tamil cinema composers and music directors.',
        items: topMusicDirectors.slice(0, 8).map(md => ({
            name: md.name,
            image: md.image,
            role: 'Music Director',
        })),
    });

    return (
        <div className="mb-8">
            <StructuredData data={artistItemListSchema} />
            <div className="px-3 sm:px-4">
                <SectionHeader
                    title="Hall of Maestros"
                    subtitle="The Architects of Tamil Cinema Sound"
                    href="/directory?category=music_director"
                />
            </div>

            {/* Apple Music Style Hall of Fame Avatars */}
            <div className="flex gap-3 sm:gap-4 overflow-x-auto px-3 sm:px-4 pb-3 scrollbar-hide snap-x pt-1 md:grid md:grid-cols-6 lg:grid-cols-8 md:overflow-visible md:justify-items-center">
                {topMusicDirectors.slice(0, 8).map((md, idx) => {
                    const normalized = md.name.toLowerCase().trim();
                    const honoraryTitle = MAESTRO_TITLES[normalized] || 'Composer';

                    return (
                        <Link
                            key={idx}
                            href={`/artist/${encodeURIComponent(md.name)}`}
                            className="snap-start shrink-0 flex flex-col items-center gap-2 w-[84px] sm:w-24 group md:w-full"
                        >
                            {/* Circular Avatar with Golden Halo Ring */}
                            <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 border-2 border-m3-surface ring-2 ring-m3-outline-variant/30 group-hover:ring-amber-400 group-hover:ring-offset-2 bg-m3-surface-container">
                                {md.image ? (
                                    <ImageWithFallback
                                        src={md.image}
                                        alt={md.name}
                                        fallbackAlt={md.name}
                                        fill
                                        sizes="80px"
                                        priority={idx < 4}
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-tr from-amber-600 to-amber-400 text-white flex items-center justify-center font-bold text-lg">
                                        {md.name[0]}
                                    </div>
                                )}
                            </div>

                            {/* Name & Epithet */}
                            <div className="text-center w-full px-0.5">
                                <p className="text-xs font-bold text-m3-on-surface truncate w-full group-hover:text-m3-primary transition-colors">
                                    {md.name}
                                </p>
                                <span className="text-[9px] text-m3-outline font-medium block truncate mt-0.5 group-hover:text-amber-500 transition-colors">
                                    {honoraryTitle}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
