
import { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { generateBaseMetadata, generateBreadcrumbSchema, generateCollectionPageSchema, combineSchemas } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';
import { splitArtists } from '@/lib/utils';

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
    ...generateBaseMetadata(),
    title: 'Site Directory - Browse All Movies & Artists',
    description: 'A complete directory of all movies and artists featured on TamilRing. Find your favorite Tamil movie ringtones efficiently.',
};

export default async function DirectoryPage() {
    // Fetch all movies and artists from the ringtones table (since we don't have separate tables)
    const { data: ringtones } = await supabase
        .from('ringtones')
        .select('movie_name, singers, music_director, movie_director')
        .eq('status', 'approved');

    if (!ringtones) return <div>Failed to load directory.</div>;

    const movies = new Set<string>();
    const artists = new Set<string>();

    ringtones.forEach(r => {
        if (r.movie_name) movies.add(r.movie_name);
        if (r.singers) splitArtists(r.singers).forEach(a => artists.add(a));
        if (r.music_director) splitArtists(r.music_director).forEach(a => artists.add(a));
        if (r.movie_director) splitArtists(r.movie_director).forEach(a => artists.add(a));
    });

    const sortedMovies = Array.from(movies).sort();
    const sortedArtists = Array.from(artists).sort();

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Directory', url: '/directory' },
    ]);

    const collectionPageSchema = generateCollectionPageSchema({
        name: 'TamilRing Complete Site Directory',
        description: 'Complete directory of all Tamil movies and artists featured on TamilRing.',
        url: '/directory',
        numberOfItems: sortedMovies.length + sortedArtists.length,
    });

    const combinedSchema = combineSchemas(collectionPageSchema, breadcrumbSchema);

    return (
        <div className="max-w-4xl mx-auto p-6 pb-24 min-h-screen">
            <StructuredData data={combinedSchema} />
            <h1 className="text-3xl font-display font-bold mb-8 text-m3-on-surface">Site Directory</h1>
            
            <div className="grid md:grid-cols-2 gap-12">
                {/* Movies Section */}
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-m3-primary">
                        <span>🎬</span> Movies ({sortedMovies.length})
                    </h2>
                    <div className="space-y-1 max-h-[600px] overflow-y-auto pr-4 scrollbar-hide border-t border-m3-outline-variant/30 pt-4">
                        {sortedMovies.map(movie => (
                            <Link 
                                key={movie} 
                                href={`/movie/${encodeURIComponent(movie)}`}
                                className="block py-1.5 text-sm text-m3-on-surface-variant hover:text-m3-primary transition-colors border-b border-m3-outline-variant/20 last:border-0"
                            >
                                {movie}
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Artists Section */}
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-m3-secondary">
                        <span>🎤</span> Artists ({sortedArtists.length})
                    </h2>
                    <div className="space-y-1 max-h-[600px] overflow-y-auto pr-4 scrollbar-hide border-t border-m3-outline-variant/30 pt-4">
                        {sortedArtists.map(artist => (
                            <Link 
                                key={artist} 
                                href={`/artist/${encodeURIComponent(artist)}`}
                                className="block py-1.5 text-sm text-m3-on-surface-variant hover:text-m3-secondary transition-colors border-b border-m3-outline-variant/20 last:border-0"
                            >
                                {artist}
                            </Link>
                        ))}
                    </div>
                </section>
            </div>

            <div className="mt-12 p-6 bg-m3-surface-container-low rounded-2xl border border-m3-outline-variant/30 italic text-sm text-m3-on-surface-variant text-center">
                This directory is updated daily to include all newly added content.
            </div>
        </div>
    );
}
