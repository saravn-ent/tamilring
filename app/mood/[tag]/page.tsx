import { supabase } from '@/lib/supabaseClient';
import RingtoneCard from '@/components/RingtoneCard';
import SectionHeader from '@/components/SectionHeader';

export default async function MoodPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag: paramTag } = await params;
  const tag = decodeURIComponent(paramTag);
  
  const { data: ringtones } = await supabase
    .from('ringtones')
    .select('*')
    .contains('tags', [tag]) // Assumes 'tags' is an array column
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-md mx-auto">
      <div className="p-6 bg-gradient-to-b from-emerald-900/20 to-neutral-900">
        <h1 className="text-3xl font-bold text-white capitalize">{tag}</h1>
        <p className="text-zinc-400 text-sm mt-1">Best {tag} Ringtones</p>
      </div>
      
      <div className="px-4 -mt-4">
        {ringtones && ringtones.length > 0 ? (
          <div className="space-y-4">
            {ringtones.map((ringtone) => (
              <RingtoneCard key={ringtone.id} ringtone={ringtone} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500">
            No ringtones found for this mood.
          </div>
        )}
      </div>
    </div>
  );
}
