import { supabase } from '@/lib/supabaseClient';
import RingtoneCard from '@/components/RingtoneCard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SortControl from '@/components/SortControl';
import { Ringtone } from '@/types';

export const revalidate = 0;

export default async function RecentPage({
  searchParams
}: {
  searchParams: Promise<{ sort?: string }>
}) {
  const { sort } = await searchParams;

  let query = supabase
    .from('ringtones')
    .select('*')
    .eq('status', 'approved');

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

  const { data: recent } = await query.limit(50);

  return (
    <div className="max-w-md mx-auto p-4 pb-24">
      <header className="flex items-center gap-4 py-4 mb-3">
        <Link href="/" className="p-2 bg-zinc-100 rounded-full text-zinc-600 hover:text-brand-accent transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-black text-zinc-900">Just Added</h1>
      </header>

      <div className="flex justify-end mb-4">
        <SortControl />
      </div>

      <div className="space-y-4">
        {recent?.map((ringtone: Ringtone) => (
          <RingtoneCard key={ringtone.id} ringtone={ringtone} />
        ))}
      </div>
    </div>
  );
}
