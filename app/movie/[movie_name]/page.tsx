import { supabase } from '@/lib/supabaseClient';
export const revalidate = 3600;
import RingtoneCard from '@/components/RingtoneCard';
import SortControl from '@/components/SortControl';
import Image from 'next/image';
import TMDBImage from '@/components/TMDBImage';
import FavoriteButton from '@/components/FavoriteButton';
import { Metadata } from 'next';
import { cacheGetOrSet, CacheKeys, CacheTTL } from '@/lib/cache';
import { generateMovieMetadata } from '@/lib/seo';
import { generateMovieSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';
import MovieRingtonesList from '@/components/movie/MovieRingtonesList';
import { Suspense } from 'react';
import { RingtoneGridSkeleton } from '@/components/skeletons';

export async function generateMetadata({ params }: { params: Promise<{ movie_name: string }> }): Promise<Metadata> {
  const { movie_name } = await params;
  const movieName = decodeURIComponent(movie_name);

  // Fetch movie details with caching
  const movieData = await cacheGetOrSet(
    CacheKeys.movie.byName(movieName),
    async () => {
      const { data } = await supabase
        .from('ringtones')
        .select('movie_year, music_director, movie_director, poster_url')
        .eq('status', 'approved')
        .eq('movie_name', movieName)
        .limit(1)
        .maybeSingle();
      return data;
    },
    { ttl: CacheTTL.movie.details }
  );

  if (!movieData) {
    return {
      title: 'Movie Not Found | TamilRing',
      description: 'The requested movie ringtones could not be found.',
    };
  }

  // Get ringtone count
  const { count } = await supabase
    .from('ringtones')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')
    .eq('movie_name', movieName);

  // Use our SEO metadata generator
  return generateMovieMetadata({
    name: movieName,
    poster_url: movieData.poster_url,
    year: movieData.movie_year,
    director: movieData.movie_director,
    music_director: movieData.music_director,
    ringtone_count: count || 0,
  });
}

export default async function MoviePage({
  params,
  searchParams
}: {
  params: Promise<{ movie_name: string }>,
  searchParams: Promise<{ sort?: string }>
}) {
  const { movie_name } = await params;
  const { sort } = await searchParams;
  const movieName = decodeURIComponent(movie_name);

  // Quick fetch for Movie Header Details (Single row)
  const { data: movieData } = await supabase
    .from('ringtones')
    .select('movie_year, poster_url, backdrop_url, music_director, movie_director')
    .eq('status', 'approved')
    .eq('movie_name', movieName)
    .limit(1)
    .maybeSingle();

  // Generate structured data
  // Note: We can't list all ringtones in schema efficiently without fetching them, 
  // but for "blink of eye" loading, we prioritize the page render. 
  // We'll generate basic Breadcrumb only for now to save time, or use the movieData.

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Movies', url: '/movies' },
    { name: movieName, url: `/movie/${encodeURIComponent(movieName)}` },
  ]);

  return (
    <div className="max-w-md mx-auto">
      {/* Hero Header - Loads Instantly */}
      <div className="relative h-64 w-full">
        <TMDBImage
          path={movieData?.backdrop_url}
          alt={movieName}
          fill
          sizes="100vw"
          quality={60}
          priority
          className="object-cover opacity-50"
          size="w780"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent" />

        {/* Favorite Button */}
        <div className="absolute top-4 right-4 z-10">
          <FavoriteButton
            item={{
              id: movieName,
              name: movieName,
              type: 'Movie',
              imageUrl: movieData?.poster_url,
              href: `/movie/${encodeURIComponent(movieName)}`
            }}
            className="w-10 h-10 bg-black/20 backdrop-blur-md hover:bg-black/40"
          />
        </div>

        <div className="absolute bottom-0 left-0 p-6 flex items-end gap-4">
          {movieData?.poster_url && (
            <div className="relative w-24 h-36 rounded-lg overflow-hidden shadow-2xl border border-neutral-700">
              <TMDBImage
                path={movieData.poster_url}
                alt={movieName}
                fill
                sizes="96px"
                quality={80}
                className="object-cover"
              />
            </div>
          )}
          <div className="mb-2">
            <h1 className="text-2xl font-bold text-white leading-tight">{movieName}</h1>
            <p className="text-zinc-400 text-sm">{movieData?.movie_year}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4 sticky top-0 z-30 bg-white/95 backdrop-blur-md py-2 -mx-4 px-4 border-b border-brand-border">
          <h2 className="text-lg font-bold text-brand-dark">All Ringtones</h2>
          <SortControl />
        </div>

        {/* Ringtones List - Streams in */}
        <Suspense fallback={<div className="space-y-4"><RingtoneGridSkeleton count={4} /></div>}>
          <MovieRingtonesList movieName={movieName} sort={sort} />
        </Suspense>

      </div>

      {/* Structured Data */}
      <StructuredData data={breadcrumbSchema} />
    </div>
  );
}
