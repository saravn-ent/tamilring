import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
export const revalidate = 3600;
import TMDBImage from '@/components/TMDBImage';
import FavoriteButton from '@/components/FavoriteButton';
import { Metadata } from 'next';
import Link from 'next/link';
import { Music, Disc3 } from 'lucide-react';
import { cacheGetOrSet, CacheKeys, CacheTTL } from '@/lib/cache';
import { generateMovieMetadata, generateMovieSchema, generateMusicAlbumSchema, generateBreadcrumbSchema, generateItemListSchema, combineSchemas } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';
import MovieRingtonesList from '@/components/movie/MovieRingtonesList';
import { ShareAlbumButton } from '@/components/movie/MovieHeroActions';
import { Suspense } from 'react';
import { RingtoneGridSkeleton } from '@/components/skeletons';
import BackButton from '@/components/BackButton';
import MovieArtistSuggestions from '@/components/movie/MovieArtistSuggestions';
import { getMovieArtists, getArtistSuggestions } from '@/lib/server/suggestedArtists';
import { Ringtone } from '@/types';

export async function generateMetadata({ params }: { params: Promise<{ movie_name: string }> }): Promise<Metadata> {
  const { movie_name } = await params;
  const movieName = decodeURIComponent(movie_name);

  // Fetch movie details with caching
  const movieData = await cacheGetOrSet(
    CacheKeys.movie.byName(movieName),
    async () => {
      const { data, count } = await supabase
        .from('ringtones')
        .select('id, title, slug, audio_url, duration, movie_name, song_name, movie_year, music_director, movie_director, poster_url, backdrop_url, downloads, likes', { count: 'exact' })
        .eq('status', 'approved')
        .eq('movie_name', movieName)
        .order('downloads', { ascending: false })
        .limit(1);

      if (!data || data.length === 0) return null;
      return {
        ...data[0],
        totalCount: count || 0,
        firstRingtone: data[0] as Ringtone
      };
    },
    { ttl: CacheTTL.movie.details }
  );

  if (!movieData) {
    return {
      title: 'Movie Not Found | TamilRing',
      description: 'The requested movie ringtones could not be found.',
    };
  }

  // Use our SEO metadata generator
  return generateMovieMetadata({
    name: movieName,
    poster_url: movieData.poster_url,
    year: movieData.movie_year,
    director: movieData.movie_director,
    music_director: movieData.music_director,
  });
}

async function MovieSuggestionsSection({
  movieName,
  musicDirector
}: {
  movieName: string;
  musicDirector?: string | null;
}) {
  const artists = await getMovieArtists(movieName);
  if (!artists || artists.length === 0) return null;

  // Find default artist: prefer matching Music Director, or first Music Director, or Director, or first artist
  const defaultArtist =
    artists.find(a => a.role === 'Music Director' && a.name.toLowerCase() === musicDirector?.toLowerCase()) ||
    artists.find(a => a.role === 'Music Director') ||
    artists.find(a => a.role === 'Director') ||
    artists[0];

  const initialSuggestions = await getArtistSuggestions(defaultArtist.name, defaultArtist.role, movieName);

  return (
    <MovieArtistSuggestions
      currentMovie={movieName}
      artists={artists}
      initialArtist={defaultArtist}
      initialSuggestions={initialSuggestions}
    />
  );
}

export default async function MoviePage({
  params,
  searchParams
}: {
  params: Promise<{ movie_name: string }>,
  searchParams: Promise<{ page?: string }>
}) {
  const { movie_name } = await params;
  const { page } = await searchParams;
  const movieName = decodeURIComponent(movie_name);
  const currentPage = page ? parseInt(page) : 1;

  // Fetch movie details, top ringtone, and total ringtone count with caching
  const movieData = await cacheGetOrSet(
    CacheKeys.movie.byName(movieName),
    async () => {
      const { data, count } = await supabase
        .from('ringtones')
        .select('id, title, slug, audio_url, duration, movie_name, song_name, movie_year, music_director, movie_director, poster_url, backdrop_url, downloads, likes', { count: 'exact' })
        .eq('status', 'approved')
        .eq('movie_name', movieName)
        .order('downloads', { ascending: false })
        .limit(1);

      if (!data || data.length === 0) return null;
      return {
        ...data[0],
        totalCount: count || 0,
        firstRingtone: data[0] as Ringtone
      };
    },
    { ttl: CacheTTL.movie.details }
  );

  if (!movieData) {
    notFound();
  }

  // Fetch movie tracks for structured data
  const movieTracks = await cacheGetOrSet(
    `movie:tracks:${movieName}`,
    async () => {
      const { data } = await supabase
        .from('ringtones')
        .select('title, slug, duration')
        .eq('status', 'approved')
        .eq('movie_name', movieName)
        .order('downloads', { ascending: false });
      return data || [];
    },
    { ttl: CacheTTL.movie.details }
  );

  // Generate structured data
  const movieSchema = generateMovieSchema({
    name: movieName,
    poster_url: movieData.poster_url,
    year: movieData.movie_year,
    director: movieData.movie_director,
    music_director: movieData.music_director,
    ringtones: movieTracks,
  });

  const albumSchema = generateMusicAlbumSchema({
    name: movieName,
    poster_url: movieData.poster_url,
    year: movieData.movie_year,
    music_director: movieData.music_director,
    ringtones: movieTracks,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/categories' },
    { name: movieName, url: `/movie/${encodeURIComponent(movieName)}` },
  ]);

  // ItemList schema — enables Google Carousel rich results for movie ringtone collection
  const itemListSchema = generateItemListSchema({
    name: `${movieName} Ringtones`,
    description: `Download all ${movieName} Tamil movie ringtones. Free BGM and song ringtones for Android and iPhone.`,
    items: movieTracks.map(t => ({
      title: t.title,
      slug: t.slug,
    })),
  });

  const combinedSchema = combineSchemas(movieSchema, albumSchema, itemListSchema, breadcrumbSchema);

  return (
    <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto pb-24 px-3 sm:px-6 pt-2 sm:pt-4">
      {/* Cinematic Hero Container - Space-Efficient Compact Layout */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-4 bg-m3-surface-container-low border border-m3-outline-variant/30 shadow-xs">
        {/* Backdrop Image */}
        {(movieData?.backdrop_url || movieData?.poster_url) && (
          <TMDBImage
            path={movieData?.backdrop_url || movieData?.poster_url}
            alt={movieName}
            fill
            sizes="100vw"
            quality={70}
            priority
            className="object-cover opacity-30 scale-105 blur-xs pointer-events-none"
            size="original"
          />
        )}
        
        {/* Deep Contrast Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/75 to-black/40 backdrop-blur-[1px]" />

        <div className="relative z-10 w-full p-3 sm:p-5 flex flex-col gap-2.5">
          {/* Top Navigation Row */}
          <div className="flex items-center justify-between gap-2">
            <BackButton 
              fallbackHref="/categories" 
              className="h-8 px-3.5 bg-black/60 hover:bg-black/80 text-white! border border-white/20 backdrop-blur-md shadow-xs text-xs font-semibold" 
            />

            <div className="flex items-center gap-1.5">
              <ShareAlbumButton movieName={movieName} />
              <FavoriteButton
                item={{
                  id: movieName,
                  name: movieName,
                  type: 'Movie',
                  imageUrl: movieData?.poster_url,
                  href: `/movie/${encodeURIComponent(movieName)}`
                }}
                className="w-8 h-8 sm:w-8.5 sm:h-8.5 bg-black/60 hover:bg-black/80 text-white! border border-white/20 backdrop-blur-md shadow-xs"
                iconSize={16}
              />
            </div>
          </div>

          {/* Hero Main Content Row: Side-by-side on all screens */}
          <div className="flex items-center sm:items-end gap-3 sm:gap-5">
            {/* Poster Card */}
            {movieData?.poster_url ? (
              <div className="relative w-20 h-28 sm:w-28 sm:h-40 md:w-32 md:h-46 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-white/20 shrink-0 bg-neutral-900">
                <TMDBImage
                  path={movieData.poster_url}
                  alt={movieName}
                  fill
                  sizes="(max-width: 640px) 80px, (max-width: 768px) 112px, 128px"
                  quality={80}
                  priority
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-28 sm:w-28 sm:h-40 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white/50 shrink-0">
                <Disc3 size={28} />
              </div>
            )}

            {/* Title, Credits, Badges & CTA */}
            <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1.5 text-white/80">
                <span className="px-2 py-0.5 rounded-md bg-m3-primary text-white font-bold tracking-wider uppercase text-[9px]">
                  Movie Album
                </span>
                {movieData?.movie_year && (
                  <span className="px-1.5 py-0.5 rounded-md bg-white/15 backdrop-blur-md text-white border border-white/10 text-[10px] font-medium">
                    {movieData.movie_year}
                  </span>
                )}
                {movieData?.totalCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-white/15 backdrop-blur-md text-white border border-white/10 text-[10px] font-medium">
                    {movieData.totalCount} tracks
                  </span>
                )}
              </div>

              {/* Movie Title */}
              <h1 className="text-lg sm:text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight leading-snug line-clamp-2">
                {movieName}
              </h1>

              {/* Credits Row: Music Director & Director as clean text links without pill */}
              {(movieData?.music_director || movieData?.movie_director) && (
                <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-xs text-white/90">
                  {movieData?.music_director && (
                    <div className="flex items-center gap-1">
                      <span className="text-white/60 text-[11px]">Music:</span>
                      <Link
                        href={`/artist/${encodeURIComponent(movieData.music_director)}`}
                        className="text-white hover:text-m3-primary font-semibold hover:underline underline-offset-3 decoration-white/40 transition-colors text-xs"
                      >
                        {movieData.music_director}
                      </Link>
                    </div>
                  )}
                  {movieData?.movie_director && (
                    <div className="flex items-center gap-1 text-white/80">
                      <span className="text-white/40 select-none text-[10px]">•</span>
                      <span className="text-white/60 text-[11px]">Dir:</span>
                      <span className="font-medium text-white/95 text-xs">{movieData.movie_director}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tracklist Header */}
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-bold text-m3-on-surface">All Ringtones</h2>
          {movieData?.totalCount > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-m3-surface-container text-m3-on-surface-variant border border-m3-outline-variant/40">
              {movieData.totalCount}
            </span>
          )}
        </div>
      </div>

      {/* Ringtones List - Streams in */}
      <Suspense fallback={<RingtoneGridSkeleton count={6} />}>
        <MovieRingtonesList movieName={movieName} page={currentPage} />
      </Suspense>

      {/* Dynamic Multi-Artist Suggestions (Music Director, Director, Actors, Singers, Lyricists) */}
      <Suspense fallback={null}>
        <MovieSuggestionsSection
          movieName={movieName}
          musicDirector={movieData?.music_director}
        />
      </Suspense>

      {/* Structured Data */}
      <StructuredData data={combinedSchema} />
    </div>
  );
}
