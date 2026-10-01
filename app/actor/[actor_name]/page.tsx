export const revalidate = 3600;
import { supabase } from '@/lib/supabaseClient';
import { searchPerson, getImageUrl, getPersonMovieCredits } from '@/lib/tmdb';
import RingtoneCard from '@/components/RingtoneCard';
import CompactProfileHeader from '@/components/CompactProfileHeader';
import SortControl from '@/components/SortControl';
import ViewToggle from '@/components/ViewToggle';
import { getArtistBio } from '@/lib/constants';
import Link from 'next/link';
import TMDBImage from '@/components/TMDBImage';
import { Ringtone } from '@/types';
import { unstable_cache } from 'next/cache';
import { Metadata } from 'next';
import {
  generateArtistMetadata,
  generatePersonSchema,
  generateBreadcrumbSchema,
  generateCollectionPageSchema,
  generateItemListSchema,
  combineSchemas
} from '@/lib/seo';
import StructuredData from '@/components/StructuredData';

const getActorRingtones = unstable_cache(
  async (actorName: string, sort: string = 'recent', additionalMovieNames: string[] = []) => {
    const searchLow = actorName.toLowerCase().trim();

    // Query 1: Direct matches on cast_members
    let query1 = supabase
      .from('ringtones')
      .select('*')
      .eq('status', 'approved')
      .ilike('cast_members', `%${actorName}%`);

    // Query 2: Matches on known movie titles for this actor
    let query2 = null;
    if (additionalMovieNames.length > 0) {
      query2 = supabase
        .from('ringtones')
        .select('*')
        .eq('status', 'approved')
        .in('movie_name', additionalMovieNames);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applySort = (q: any) => {
      switch (sort) {
        case 'downloads':
          return q.order('downloads', { ascending: false });
        case 'likes':
          return q.order('likes', { ascending: false });
        case 'year_desc':
          return q.order('movie_year', { ascending: false, nullsFirst: false });
        case 'year_asc':
          return q.order('movie_year', { ascending: true, nullsFirst: false });
        default:
          return q.order('created_at', { ascending: false });
      }
    };

    query1 = applySort(query1);
    if (query2) query2 = applySort(query2);

    const [res1, res2] = await Promise.all([
      query1.limit(100),
      query2 ? query2.limit(100) : Promise.resolve({ data: [] })
    ]);

    const data1 = (res1.data as Ringtone[]) || [];
    const data2 = (res2.data as Ringtone[]) || [];

    // Merge and deduplicate by ringtone ID
    const uniqueMap = new Map<string, Ringtone>();
    [...data1, ...data2].forEach(item => uniqueMap.set(item.id, item));
    const combined = Array.from(uniqueMap.values());

    // Word boundary & precise match filter for cast_members to avoid substring false positives
    const filtered = combined.filter(r => {
      if (additionalMovieNames.includes(r.movie_name)) return true;
      if (!r.cast_members) return false;
      const parts = r.cast_members.toLowerCase().split(/[,&]|\band\b/i).map(s => s.trim());
      return parts.some(p => p === searchLow || p.includes(searchLow));
    });

    return filtered.sort((a, b) => {
      if (sort === 'downloads') return (b.downloads || 0) - (a.downloads || 0);
      if (sort === 'likes') return (b.likes || 0) - (a.likes || 0);
      if (sort === 'year_desc') return (parseInt(b.movie_year || '0') || 0) - (parseInt(a.movie_year || '0') || 0);
      if (sort === 'year_asc') return (parseInt(a.movie_year || '0') || 0) - (parseInt(b.movie_year || '0') || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  },
  ['actor-ringtones-v3'],
  { revalidate: 3600 }
);

export async function generateMetadata({ params }: { params: Promise<{ actor_name: string }> }): Promise<Metadata> {
  const { actor_name } = await params;
  const actorName = decodeURIComponent(actor_name);
  return generateArtistMetadata({ name: actorName, role: 'actor' });
}

export default async function ActorPage({
  params,
  searchParams
}: {
  params: Promise<{ actor_name: string }>,
  searchParams: Promise<{ sort?: string; view?: string }>
}) {
  const { actor_name } = await params;
  const { sort, view } = await searchParams;
  const actorName = decodeURIComponent(actor_name);
  const currentView = view || 'movies'; // Default to movies

  // Fetch actor from TMDB and get their movie credits
  const person = await searchPerson(actorName);
  let movieTitles: string[] = [];
  if (person?.id) {
    const credits = await getPersonMovieCredits(person.id);
    if (credits?.cast) {
      movieTitles = credits.cast
        .filter(m => m.title)
        .sort((a, b) => new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime())
        .slice(0, 50)
        .map(m => m.title);
    }
  }

  const ringtones = await getActorRingtones(actorName, sort, movieTitles);

  // Fetch actor image from TMDB or fallback to first ringtone poster
  const actorImage = person?.profile_path
    ? getImageUrl(person.profile_path, 'w185')
    : ringtones?.find(r => r.poster_url)?.poster_url;

  // Get actor bio
  const actorBio = getArtistBio(actorName);

  // --- Structured Data ---
  const personSchema = generatePersonSchema({
    name: actorName,
    image_url: actorImage || undefined,
    role: 'actor',
    description: `Tamil Cinema Actor known for ${ringtones?.slice(0, 3).map(r => r.movie_name).filter(Boolean).join(', ') || 'Tamil Movies'}.`,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Actors', url: '/categories' },
    { name: actorName, url: `/actor/${encodeURIComponent(actorName)}` },
  ]);

  const collectionPageSchema = generateCollectionPageSchema({
    name: `${actorName} Tamil Ringtones & Movies`,
    description: `Download Tamil ringtones from ${actorName} movies. High quality BGM, mass themes, songs, and dialogue cuts for Android and iPhone.`,
    url: `/actor/${encodeURIComponent(actorName)}`,
    numberOfItems: ringtones?.length || 0,
  });

  // ItemList schema with artwork_url for Google Carousel eligibility
  const itemListSchema = ringtones && ringtones.length > 0 ? generateItemListSchema({
    name: `Top ${actorName} Ringtones`,
    description: `Popular Tamil movie ringtones featuring ${actorName}. Free download in MP3 and M4R formats.`,
    items: ringtones.slice(0, 10).map(r => ({
      title: r.title,
      slug: r.slug,
      artwork_url: r.poster_url || actorImage || undefined,
    })),
  }) : null;

  const combinedSchema = itemListSchema
    ? combineSchemas(personSchema, collectionPageSchema, itemListSchema, breadcrumbSchema)
    : combineSchemas(personSchema, collectionPageSchema, breadcrumbSchema);

  // Group by Movies for "Movies" view
  const moviesMap = new Map<string, Ringtone>();
  if (ringtones) {
    ringtones.forEach(r => {
      if (!moviesMap.has(r.movie_name)) {
        moviesMap.set(r.movie_name, r);
      }
    });
  }
  const uniqueMovies = Array.from(moviesMap.values());

  return (
    <div className="max-w-md mx-auto pb-24">
      <StructuredData data={combinedSchema} />
      {/* Sticky Compact Profile Header */}
      <CompactProfileHeader
        name={actorName}
        type="Actor"
        imageUrl={actorImage}
        bio={actorBio}
        ringCount={ringtones?.length || 0}
        shareMetadata={{
          title: `${actorName} Ringtones`,
          text: `Check out the best ringtones from ${actorName} movies on TamilRing!`,
        }}
      />

      {/* Sticky Controls Bar */}
      <div className="sticky top-[120px] z-30 bg-m3-surface/90 backdrop-blur-md border-b border-m3-outline-variant/30 px-4 py-2.5 space-y-3 shadow-xs">
        <ViewToggle />
        <div className="flex justify-end">
          <SortControl />
        </div>
      </div>

      <div className="px-4 py-6">
        {ringtones && ringtones.length > 0 ? (
          <>
            {currentView === 'movies' ? (
              /* Movies Grid View */
              <div className="grid grid-cols-2 gap-4">
                {uniqueMovies.map((movie, idx) => (
                  <Link
                    key={movie.movie_name}
                    href={`/movie/${encodeURIComponent(movie.movie_name)}`}
                    className="group relative aspect-2/3 rounded-xl overflow-hidden bg-brand-wash border border-brand-border shadow-md"
                  >
                    <TMDBImage
                      path={movie.poster_url}
                      alt=""
                      fallbackAlt={movie.movie_name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 50vw, 33vw"
                      priority={idx < 2}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 mb-1 group-hover:text-brand-accent transition-colors">
                        {movie.movie_name}
                      </h3>
                      <p className="text-zinc-300 text-xs font-medium">{movie.movie_year}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* Rings List View */
              <div className="space-y-4">
                {ringtones.map((ringtone) => (
                  <RingtoneCard key={ringtone.id} ringtone={ringtone} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-zinc-500">
            <p>No ringtones found for this actor.</p>
          </div>
        )}
      </div>
    </div>
  );
}
