import { supabase } from '@/lib/supabaseClient';
import RingtoneCard from '@/components/RingtoneCard';
import SortControl from '@/components/SortControl';
import Image from 'next/image';

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

  let query = supabase
    .from('ringtones')
    .select('*')
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

  const movie = ringtones?.[0];

  return (
    <div className="max-w-md mx-auto">
      {/* Hero Header */}
      <div className="relative h-64 w-full">
        {movie?.backdrop_url ? (
          <Image
            src={movie.backdrop_url}
            alt={movieName}
            fill
            className="object-cover opacity-50"
          />
        ) : (
          <div className="w-full h-full bg-neutral-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent" />

        <div className="absolute bottom-0 left-0 p-6 flex items-end gap-4">
          {movie?.poster_url && (
            <div className="relative w-24 h-36 rounded-lg overflow-hidden shadow-2xl border border-neutral-700">
              <Image src={movie.poster_url} alt={movieName} fill className="object-cover" />
            </div>
          )}
          <div className="mb-2">
            <h1 className="text-2xl font-bold text-white leading-tight">{movieName}</h1>
            <p className="text-zinc-400 text-sm">{movie?.movie_year}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4 sticky top-0 z-30 bg-neutral-900/95 backdrop-blur-md py-2 -mx-4 px-4 border-b border-white/5">
          <h2 className="text-lg font-bold">All Ringtones</h2>
          <SortControl />
        </div>
        {ringtones && ringtones.length > 0 ? (
          <div className="space-y-4">
            {ringtones.map((ringtone) => (
              <RingtoneCard key={ringtone.id} ringtone={ringtone} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500">
            No ringtones found.
          </div>
        )}
      </div>
    </div>
  );
}
