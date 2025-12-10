import { supabase } from '@/lib/supabaseClient';
import { searchPerson, getImageUrl } from '@/lib/tmdb';
import CompactProfileHeader from '@/components/CompactProfileHeader';
import RingtoneCard from '@/components/RingtoneCard';
import SortControl from '@/components/SortControl';
import { Metadata } from 'next';
import { getArtistBio } from '@/lib/constants';

interface Props {
    params: Promise<{ artist_name: string }>;
    searchParams: Promise<{ sort?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { artist_name } = await params;
    const artistName = decodeURIComponent(artist_name);

    return {
        title: `${artistName} Hits Ringtones Download - Best ${artistName} Tamil BGM`,
        description: `Download best ringtones composed by ${artistName}. High quality BGM, love themes, and mass FLutes from ${artistName} movies.`,
        alternates: {
            canonical: `/tamil/music-directors/${artist_name}`,
        },
        openGraph: {
            title: `${artistName} Best BGM & Ringtones`,
            description: `Download ${artistName} hits ringtones.`,
            type: 'music.playlist',
        }
    };
}

export default async function MusicDirectorSiloPage({ params, searchParams }: Props) {
    const { artist_name } = await params;
    const { sort } = await searchParams;
    const artistName = decodeURIComponent(artist_name);

    // Programmatic Query for Music Director
    let query = supabase
        .from('ringtones')
        .select('*')
        .eq('status', 'approved')
        // Flexible search for MD name in music_director column
        .ilike('music_director', `%${artistName}%`);

    switch (sort) {
        case 'downloads': query = query.order('downloads', { ascending: false }); break;
        case 'likes': query = query.order('likes', { ascending: false }); break;
        case 'year_desc': query = query.order('movie_year', { ascending: false }); break;
        default: query = query.order('created_at', { ascending: false });
    }

    const { data: ringtones } = await query;

    // Calculate Stats
    const totalLikes = ringtones?.reduce((sum, r) => sum + (r.likes || 0), 0) || 0;

    // Fetch TMDB Image
    const person = await searchPerson(artistName);
    const artistImage = person?.profile_path ? getImageUrl(person.profile_path) : null;
    const bio = getArtistBio(artistName);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${artistName} Best Ringtones`,
        description: `Top BGM and Ringtones by ${artistName}`,
        mainEntity: {
            '@type': 'ItemList',
            itemListElement: ringtones?.map((ring, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: `https://tamilring.in/ringtone/${ring.slug}`,
                name: `${ring.title}`
            }))
        }
    };

    return (
        <div className="max-w-md mx-auto min-h-screen bg-neutral-900 pb-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <CompactProfileHeader
                name={artistName}
                type="Music Director"
                ringtoneCount={ringtones?.length || 0}
                movieCount={new Set(ringtones?.map(r => r.movie_name)).size}
                totalLikes={totalLikes}
                imageUrl={artistImage}
                bio={bio}
                shareMetadata={{
                    title: `${artistName} BGM Download`,
                    text: `Download the best BGM and ringtones by ${artistName} on TamilRing!`
                }}
            />

            <div className="sticky top-[120px] z-30 bg-neutral-900/95 backdrop-blur-md border-b border-white/5 py-3 px-4 flex justify-between items-center">
                <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Top Hits</h2>
                <SortControl />
            </div>

            <div className="px-4 py-6 space-y-4">
                {ringtones && ringtones.length > 0 ? (
                    ringtones.map(ringtone => (
                        <RingtoneCard key={ringtone.id} ringtone={ringtone} />
                    ))
                ) : (
                    <div className="text-center py-20 text-zinc-500">
                        No ringtones found for {artistName}
                    </div>
                )}
            </div>
        </div>
    );
}
