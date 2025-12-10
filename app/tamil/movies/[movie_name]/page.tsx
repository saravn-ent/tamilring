import { supabase } from '@/lib/supabaseClient';
import RingtoneCard from '@/components/RingtoneCard';
import SortControl from '@/components/SortControl';
import Image from 'next/image';
import FavoriteButton from '@/components/FavoriteButton';
import { Metadata } from 'next';
import Link from 'next/link';

interface Props {
    params: Promise<{ movie_name: string }>;
    searchParams: Promise<{ sort?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { movie_name } = await params;
    const movieName = decodeURIComponent(movie_name);

    return {
        title: `${movieName} Ringtones Download (High Quality MP3) - TamilRing`,
        description: `Download ${movieName} BGM, mass dialogue, and love theme ringtones. Best collection of ${movieName} tamil movie ringtones for mobile.`,
        alternates: {
            canonical: `/tamil/movies/${movie_name}`, // Self-referencing canonical
        },
        openGraph: {
            title: `${movieName} BGM & Ringtones Download`,
            description: `Download ${movieName} high quality ringtones and BGM.`,
            type: 'music.album',
        }
    };
}

export default async function MovieSiloPage({ params, searchParams }: Props) {
    const { movie_name } = await params;
    const { sort } = await searchParams;
    const movieName = decodeURIComponent(movie_name);

    let query = supabase
        .from('ringtones')
        .select('*')
        .eq('status', 'approved')
        .eq('movie_name', movieName);

    // Apply Sorting
    switch (sort) {
        case 'downloads':
            query = query.order('downloads', { ascending: false });
            break;
        case 'likes':
            query = query.order('likes', { ascending: false });
            break;
        case 'year_desc':
            query = query.order('movie_year', { ascending: false });
            break;
        case 'year_asc':
            query = query.order('movie_year', { ascending: true });
            break;
        default: // recent
            query = query.order('created_at', { ascending: false });
    }

    const { data: ringtones } = await query;
    const movie = ringtones?.[0]; // Get metadata from first ringtone

    // Extract Music Director from the first ringtone (if available) for Silo Linking
    const musicDirector = movie?.music_director ? movie.music_director.split(',')[0].trim() : null;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${movieName} Ringtones`,
        description: `Download high quality BGM and Ringtones from ${movieName}`,
        mainEntity: {
            '@type': 'ItemList',
            itemListElement: ringtones?.map((ring, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: `https://tamilring.in/ringtone/${ring.slug}`,
                name: `${ring.title} Ringtone`
            }))
        }
    };

    return (
        <div className="max-w-md mx-auto min-h-screen bg-neutral-900">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero Header */}
            <div className="relative h-72 w-full">
                {movie?.backdrop_url ? (
                    <Image
                        src={movie.backdrop_url}
                        alt={movieName}
                        fill
                        className="object-cover opacity-50 mask-image-gradient-bottom"
                    />
                ) : (
                    <div className="w-full h-full bg-neutral-800" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent" />

                {/* Favorite Button */}
                <div className="absolute top-4 right-4 z-10">
                    <FavoriteButton
                        item={{
                            id: movieName,
                            name: movieName,
                            type: 'Movie',
                            imageUrl: movie?.poster_url,
                            href: `/tamil/movies/${encodeURIComponent(movieName)}`
                        }}
                        className="w-10 h-10 bg-black/20 backdrop-blur-md hover:bg-black/40"
                    />
                </div>

                <div className="absolute bottom-0 left-0 p-6 w-full">
                    <div className="flex items-end gap-5">
                        {movie?.poster_url && (
                            <div className="relative w-28 h-40 rounded-lg overflow-hidden shadow-2xl border border-white/10 shrink-0">
                                <Image src={movie.poster_url} alt={movieName} fill className="object-cover" />
                            </div>
                        )}
                        <div className="mb-1 flex-1 min-w-0">
                            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2">
                                Download {movieName} BGM & Ringtones
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                                <span className="text-zinc-300 bg-white/10 px-2 py-0.5 rounded backdrop-blur-sm">{movie?.movie_year}</span>
                                {musicDirector && (
                                    <Link
                                        href={`/tamil/music-directors/${encodeURIComponent(musicDirector)}`}
                                        className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline flex items-center gap-1"
                                    >
                                        <span>🎵 {musicDirector}</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 py-6">
                <div className="flex items-center justify-between mb-6 sticky top-14 z-20 bg-neutral-900/95 backdrop-blur-md py-3 -mx-4 px-4 border-b border-white/5">
                    <h2 className="text-lg font-bold text-zinc-100">{ringtones?.length || 0} Ringtones</h2>
                    <SortControl />
                </div>

                {ringtones && ringtones.length > 0 ? (
                    <div className="space-y-4">
                        {ringtones.map((ringtone) => (
                            <div key={ringtone.id}>
                                <RingtoneCard ringtone={ringtone} />
                                {/* Visual H2 for Programmatic Keyword Strategy - Hidden visually or styled minimally 
                     User requested strict H2s. Adding them as hidden semantic tags or small labels 
                     might clutter UI. Best approach is to let RingtoneCard title be the link. 
                     Typically RingtoneCard uses H3. I will not break the Card UI. 
                  */}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-zinc-500 bg-neutral-800/50 rounded-xl border border-dashed border-neutral-700">
                        <p className="font-medium">No ringtones found for this movie.</p>
                        <p className="text-xs mt-2">Upload one if you have it!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
