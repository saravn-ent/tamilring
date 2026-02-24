
import { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { generateBaseMetadata, generateBreadcrumbSchema } from '@/lib/seo';
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

    return (
        <div className="max-w-4xl mx-auto p-6 pb-24 min-h-screen bg-white">
            <StructuredData data={breadcrumbSchema} />
            <h1 className="text-3xl font-bold mb-8 text-brand-dark">Site Directory</h1>
            
            <div className="grid md:grid-cols-2 gap-12">
                {/* Movies Section */}
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-rose-600">
                        <span>🎬</span> Movies ({sortedMovies.length})
                    </h2>
                    <div className="space-y-1 max-h-[600px] overflow-y-auto pr-4 scrollbar-hide border-t pt-4">
                        {sortedMovies.map(movie => (
                            <Link 
                                key={movie} 
                                href={`/movie/${encodeURIComponent(movie)}`}
                                className="block py-1.5 text-sm text-zinc-600 hover:text-rose-600 transition-colors border-b border-zinc-100 last:border-0"
                            >
                                {movie}
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Artists Section */}
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-600">
                        <span>🎤</span> Artists ({sortedArtists.length})
                    </h2>
                    <div className="space-y-1 max-h-[600px] overflow-y-auto pr-4 scrollbar-hide border-t pt-4">
                        {sortedArtists.map(artist => (
                            <Link 
                                key={artist} 
                                href={`/artist/${encodeURIComponent(artist)}`}
                                className="block py-1.5 text-sm text-zinc-600 hover:text-blue-600 transition-colors border-b border-zinc-100 last:border-0"
                            >
                                {artist}
                            </Link>
                        ))}
                    </div>
                </section>
            </div>

            <div className="mt-12 p-6 bg-zinc-50 rounded-2xl border border-zinc-100 italic text-sm text-zinc-500 text-center">
                This directory is updated daily to include all newly added content.
            </div>
        </div>
    );
}
