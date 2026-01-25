import { supabase } from '@/lib/supabaseClient';
import SectionHeader from '@/components/SectionHeader';
import SortControl from '@/components/SortControl';
import MoodRingtonesList from '@/components/mood/MoodRingtonesList';
import { Suspense } from 'react';
import { RingtoneGridSkeleton } from '@/components/skeletons';

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

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white">
      {/* Shell Title - Loads Instantly */}
      <div className="p-6 pt-8 bg-gradient-to-b from-emerald-50 to-white">
        <h1 className="text-3xl font-black text-brand-dark capitalize tracking-tight">{tag}</h1>
        <p className="text-zinc-500 text-sm mt-1 font-medium">Best {tag} Ringtones</p>
      </div>

      <div className="px-4 -mt-2">
        <div className="flex justify-end mb-4 sticky top-0 z-30 bg-white/95 backdrop-blur-md py-2 -mx-4 px-4 border-b border-brand-border shadow-sm">
          <SortControl />
        </div>

        <Suspense fallback={<RingtoneGridSkeleton count={6} />}>
          <MoodRingtonesList tag={tag} sort={sort} />
        </Suspense>
      </div>
    </div>
  );
}
