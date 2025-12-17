import { supabase } from '@/lib/supabaseClient';
import { searchPerson, getImageUrl } from '@/lib/tmdb';
import RingtoneCard from '@/components/RingtoneCard';
import CompactProfileHeader from '@/components/CompactProfileHeader';
import SortControl from '@/components/SortControl';
import ViewToggle from '@/components/ViewToggle';
import { getArtistBio } from '@/lib/constants';
import Link from 'next/link';
import Image from 'next/image';
import { Ringtone } from '@/types';
import { unstable_cache } from 'next/cache';

const getArtistRingtones = unstable_cache(
  async (artistName: string, sort: string = 'recent') => {
    let query = supabase
      .from('ringtones')
      .select('*')
      .eq('status', 'approved')
      .or(`singers.ilike.%${artistName}%,music_director.ilike.%${artistName}%,movie_director.ilike.%${artistName}%`);

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

    const { data } = await query;
    return data;
  },
  ['artist-ringtones'],
  { revalidate: 60 }
);

export default async function ArtistPage({
  params,
  searchParams
}: {
  params: Promise<{ artist_name: string }>,
  searchParams: Promise<{ sort?: string; view?: string }>
}) {
  const { artist_name } = await params;
  const { sort, view } = await searchParams;
  const artistName = decodeURIComponent(artist_name);
  const currentView = view || 'movies'; // Default to movies

  const ringtones = await getArtistRingtones(artistName, sort);

  // Calculate Total Likes
  const totalLikes = ringtones?.reduce((sum, ringtone) => sum + (ringtone.likes || 0), 0) || 0;

  // Fetch artist image from TMDB
  const person = await searchPerson(artistName);
  const artistImage = person?.profile_path
    ? getImageUrl(person.profile_path, 'w185')
    : ringtones?.find(r => r.poster_url)?.poster_url;

  // Get artist bio
  const artistBio = getArtistBio(artistName);

  // Determine Artist Type & Stats
  let artistType = 'Singer'; // Default
  if (person?.known_for_department === 'Sound' || person?.known_for_department === 'Composing') {
    artistType = 'Music Director';
  } else if (person?.known_for_department === 'Directing') {
    artistType = 'Movie Director';
  } else if (person?.known_for_department === 'Acting') {
    artistType = 'Actor';
  }

  // Override based on ringtone data if TMDB is ambiguous (e.g. some music directors might be listed as Sound)
  // Check if they appear frequently in music_director column
  const isMusicDirector = ringtones?.some(r => r.music_director?.toLowerCase().includes(artistName.toLowerCase()));
  if (isMusicDirector && artistType !== 'Movie Director') {
    artistType = 'Music Director';
  }

  // Group by Movies for "Movies" view & Count
  const moviesMap = new Map<string, Ringtone>();
  if (ringtones) {
    ringtones.forEach(r => {
      if (!moviesMap.has(r.movie_name)) {
        moviesMap.set(r.movie_name, r);
      }
    });
  }
  const uniqueMovies = Array.from(moviesMap.values());
  const movieCount = uniqueMovies.length;

  return (
    <div className="max-w-md mx-auto pb-24">
      {/* Sticky Compact Profile Header */}
      <CompactProfileHeader
        name={artistName}
        type={artistType as any}
        ringtoneCount={ringtones?.length || 0}
        movieCount={movieCount}
        totalLikes={totalLikes}
        imageUrl={artistImage}
        bio={artistBio}
        shareMetadata={{
          title: `${artistName} Ringtones`,
          text: `Check out the best ringtones by ${artistName} on TamilRing!`
        }}
      />

      {/* Sticky Controls Bar */}
      <div className="sticky top-[120px] z-30 bg-neutral-900/95 backdrop-blur-md border-b border-white/5 px-4 py-3 shadow-lg flex items-center justify-between gap-2">
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
                {uniqueMovies.map((movie) => (
                  <Link
                    key={movie.movie_name}
                    href={`/movie/${encodeURIComponent(movie.movie_name)}`}
                    className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-neutral-800 border border-white/5 shadow-lg"
                  >
                    {movie.poster_url ? (
                      <Image
                        src={movie.poster_url}
                        alt={movie.movie_name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600 font-bold">
                        {movie.movie_name[0]}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 mb-1 group-hover:text-emerald-400 transition-colors">
                        {movie.movie_name}
                      </h3>
                      <p className="text-zinc-400 text-xs font-medium">{movie.movie_year}</p>
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
          <div className="text-center py-20 text-zinc-500">
            No ringtones found for this artist.
          </div>
        )}
      </div>
    </div>
  );
}
