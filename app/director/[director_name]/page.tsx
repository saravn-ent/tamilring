import { supabase } from '@/lib/supabaseClient';
import { searchPerson, getImageUrl } from '@/lib/tmdb';
import RingtoneCard from '@/components/RingtoneCard';
import { Clapperboard } from 'lucide-react';
import FavoriteButton from '@/components/FavoriteButton';

export default async function DirectorPage({ params }: { params: Promise<{ director_name: string }> }) {
  const { director_name } = await params;
  const directorName = decodeURIComponent(director_name);

  const { data: ringtones } = await supabase
    .from('ringtones')
    .select('*')
    .ilike('movie_director', `%${directorName}%`)
    .order('created_at', { ascending: false });

  // Fetch director image from TMDB
  const person = await searchPerson(directorName);
  const directorImage = person?.profile_path ? getImageUrl(person.profile_path, 'w500') : null;

  return (
    <div className="max-w-md mx-auto">
      <div className="relative p-8 flex flex-col items-center justify-center bg-neutral-800/30 border-b border-neutral-800">
        {/* Favorite Button */}
        <div className="absolute top-4 right-4">
          <FavoriteButton
            item={{
              id: directorName,
              name: directorName,
              type: 'Director',
              href: `/director/${encodeURIComponent(directorName)}`
            }}
            className="w-10 h-10 bg-neutral-800 hover:bg-neutral-700"
          />
        </div>

        {directorImage ? (
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-emerald-500/20 shadow-lg">
            <img src={directorImage} alt={directorName} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 mb-4">
            <Clapperboard size={40} />
          </div>
        )}
        <h1 className="text-2xl font-bold text-white text-center">{directorName}</h1>
        <p className="text-zinc-400 text-sm mt-1">Director • {ringtones?.length || 0} Ringtones</p>
      </div>

      <div className="px-4 py-6">
        {ringtones && ringtones.length > 0 ? (
          <div className="space-y-4">
            {ringtones.map((ringtone) => (
              <RingtoneCard key={ringtone.id} ringtone={ringtone} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500">
            No ringtones found for this director.
          </div>
        )}
      </div>
    </div>
  );
}
