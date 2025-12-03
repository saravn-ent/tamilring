import { supabase } from '@/lib/supabaseClient';
import RingtoneCard from '@/components/RingtoneCard';
import SectionHeader from '@/components/SectionHeader';
import SortControl from '@/components/SortControl';

export default async function MoodPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ tag: string }>,
  searchParams: Promise<{ sort?: string }>
}) {
  const { tag: paramTag } = await params;
  const { sort } = await searchParams;
  const tag = decodeURIComponent(paramTag);
  
  let query = supabase
    .from('ringtones')
    .select('*')
    .contains('tags', [tag]);

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

  return (
    <div className="max-w-md mx-auto">
      <div className="p-6 bg-gradient-to-b from-emerald-900/20 to-neutral-900">
        <h1 className="text-3xl font-bold text-white capitalize">{tag}</h1>
        <p className="text-zinc-400 text-sm mt-1">Best {tag} Ringtones</p>
      </div>
      
      <div className="px-4 -mt-4">
        <div className="flex justify-end mb-4">
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
            No ringtones found for this mood.
          </div>
        )}
      </div>
    </div>
  );
}
