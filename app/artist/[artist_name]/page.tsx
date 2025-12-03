import { supabase } from '@/lib/supabaseClient';
import RingtoneCard from '@/components/RingtoneCard';

export default async function ArtistPage({ params }: { params: Promise<{ artist_name: string }> }) {
  const { artist_name } = await params;
  const artistName = decodeURIComponent(artist_name);
  
  const { data: ringtones } = await supabase
    .from('ringtones')
    .select('*')
    .or(`singers.ilike.%${artistName}%,music_director.ilike.%${artistName}%`)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-md mx-auto">
      <div className="p-8 flex flex-col items-center justify-center bg-neutral-800/30 border-b border-neutral-800">
        <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center text-3xl font-bold text-emerald-500 mb-4">
          {artistName.charAt(0)}
        </div>
        <h1 className="text-2xl font-bold text-white text-center">{artistName}</h1>
        <p className="text-zinc-400 text-sm mt-1">{ringtones?.length || 0} Ringtones</p>
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
            No ringtones found for this artist.
          </div>
        )}
      </div>
    </div>
  );
}
