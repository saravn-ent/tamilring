import { supabase } from '@/lib/supabaseClient';
import RingtoneCard from '@/components/RingtoneCard';
import Image from 'next/image';

export default async function MoviePage({ params }: { params: Promise<{ movie_name: string }> }) {
  const { movie_name } = await params;
  const movieName = decodeURIComponent(movie_name);
  
  const { data: ringtones } = await supabase
    .from('ringtones')
    .select('*')
    .eq('movie_name', movieName)
    .order('created_at', { ascending: false });

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
        <h2 className="text-lg font-bold mb-4">All Ringtones</h2>
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
