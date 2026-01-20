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
    .eq('status', 'approved')
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
    <div className="max-w-md mx-auto min-h-screen bg-white">
      <div className="p-6 pt-8 bg-gradient-to-b from-emerald-50 to-white">
        <h1 className="text-3xl font-black text-brand-dark capitalize tracking-tight">{tag}</h1>
        <p className="text-zinc-500 text-sm mt-1 font-medium">Best {tag} Ringtones</p>
      </div>

      <div className="px-4 -mt-2">
        <div className="flex justify-end mb-4 sticky top-0 z-30 bg-white/95 backdrop-blur-md py-2 -mx-4 px-4 border-b border-brand-border shadow-sm">
          <SortControl />
        </div>
        {ringtones && ringtones.length > 0 ? (
          <div className="space-y-4">
            {ringtones.map((ringtone) => (
              <RingtoneCard key={ringtone.id} ringtone={ringtone} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500 font-medium">
            No ringtones found for this mood.
          </div>
        )}
      </div>
    </div>
  );
}
