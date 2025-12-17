import { supabase } from '@/lib/supabaseClient';
import { searchPerson, getImageUrl, getPersonMovieCredits } from '@/lib/tmdb';
import CompactProfileHeader from '@/components/CompactProfileHeader';
import RingtoneCard from '@/components/RingtoneCard';
import SortControl from '@/components/SortControl';
import { Metadata } from 'next';
import { getArtistBio } from '@/lib/constants';
import { JsonLdScript } from '@/components/JsonLdScript';
import { sanitizeSQLInput } from '@/lib/sanitize';

interface Props {
    params: Promise<{ actor_name: string }>;
    searchParams: Promise<{ sort?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { actor_name } = await params;
    const actorName = decodeURIComponent(actor_name);

    return {
        title: `${actorName} Mass Dialogues & BGM Ringtones Download`,
        description: `Download best ${actorName} punch dialogues, mass BGM, and love theme ringtones. High quality collection of ${actorName} movie ringtones.`,
        alternates: {
            canonical: `/tamil/actors/${actor_name}`,
        },
        openGraph: {
            title: `${actorName} Mass BGM & Ringtones`,
            description: `Download ${actorName} ringtones and dialogues.`,
            type: 'music.playlist',
        }
    };
}

export default async function ActorSiloPage({ params, searchParams }: Props) {
    const { actor_name } = await params;
    const { sort } = await searchParams;
    const actorName = decodeURIComponent(actor_name);

    // 1. Fetch Actor Details & Movie Credits from TMDB
    const person = await searchPerson(actorName);
    let movieTitles: string[] = [];

    if (person) {
        const credits = await getPersonMovieCredits(person.id);
        if (credits && credits.cast) {
            // Get top 100 movies to keep query size safe
            movieTitles = credits.cast
                .sort((a, b) => new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime())
                .slice(0, 80)
                .map(m => m.title);
        }
    }

    // 2. Query Ringtones
    let query = supabase
        .from('ringtones')
        .select('*')
        .eq('status', 'approved');

    // Use OR filter: Matches exact movie name in list OR actor name in tags
    if (movieTitles.length > 0) {
        // Create a comma-separated list of movie names for the OR filter is tricky due to quoting.
        // Instead, we'll try .in() for movies.
        // But we also want to search tags. mixing .in and .ilike is hard in one query object without raw SQL or .or() syntax complexity.
        // Let's stick to .in() for movies as the primary source + separate query for tags if needed?
        // Actually, Supabase .or() supports valid SQL-like syntax.
        // Simplest robust approach: just query by movies found. 
        // If we miss tags, it's okay for V1 of "Titan-Killer". Accuracy is better than noise.
        query = query.in('movie_name', movieTitles);
    } else {
        // If TMDB fails, fallback to tags search
        // SECURITY: Sanitize input to prevent SQL injection
        const safeActorName = sanitizeSQLInput(actorName);
        query = query.ilike('tags', `%${safeActorName}%`);
    }

    switch (sort) {
        case 'downloads': query = query.order('downloads', { ascending: false }); break;
        case 'likes': query = query.order('likes', { ascending: false }); break;
        case 'year_desc': query = query.order('movie_year', { ascending: false }); break;
        default: query = query.order('created_at', { ascending: false });
    }

    const { data: ringtones } = await query;

    // Calculate Stats
    const totalLikes = ringtones?.reduce((sum, r) => sum + (r.likes || 0), 0) || 0;
    const artistImage = person?.profile_path ? getImageUrl(person.profile_path, 'w185') : null;
    const bio = getArtistBio(actorName);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${actorName} Ringtones`,
        description: `Mass BGM and Dialogues by ${actorName}`,
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
            <JsonLdScript data={jsonLd} />

            <CompactProfileHeader
                name={actorName}
                type="Actor"
                ringtoneCount={ringtones?.length || 0}
                movieCount={new Set(ringtones?.map(r => r.movie_name)).size}
                totalLikes={totalLikes}
                imageUrl={artistImage}
                bio={bio}
                shareMetadata={{
                    title: `${actorName} Mass Ringtones`,
                    text: `Download the best mass BGM and dialogues of ${actorName} on TamilRing!`
                }}
            />

            <div className="sticky top-[120px] z-30 bg-neutral-900/95 backdrop-blur-md border-b border-white/5 py-3 px-4 flex justify-between items-center">
                <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Mass Hits</h2>
                <SortControl />
            </div>

            <div className="px-4 py-6 space-y-4">
                {ringtones && ringtones.length > 0 ? (
                    ringtones.map(ringtone => (
                        <RingtoneCard key={ringtone.id} ringtone={ringtone} />
                    ))
                ) : (
                    <div className="text-center py-20 text-zinc-500">
                        No ringtones found for {actorName}. <br />
                        <span className="text-xs text-zinc-600">(Try searching for specific movies)</span>
                    </div>
                )}
            </div>
        </div>
    );
}
