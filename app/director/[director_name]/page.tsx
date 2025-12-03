import { supabase } from '@/lib/supabaseClient';
import RingtoneCard from '@/components/RingtoneCard';
import { Clapperboard } from 'lucide-react';

export default async function DirectorPage({ params }: { params: Promise<{ director_name: string }> }) {
  const { director_name } = await params;
  const directorName = decodeURIComponent(director_name);
  
  const { data: ringtones } = await supabase
    .from('ringtones')
    .select('*')
    .ilike('movie_director', `%${directorName}%`)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-md mx-auto">
      <div className="p-8 flex flex-col items-center justify-center bg-neutral-800/30 border-b border-neutral-800">
        <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 mb-4">
          <Clapperboard size={40} />
        </div>
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
