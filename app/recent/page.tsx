import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SortControl from '@/components/SortControl';
import RecentRingtonesList from '@/components/recent/RecentRingtonesList';
import { Suspense } from 'react';
import { RingtoneGridSkeleton } from '@/components/skeletons';
import { generateRecentMetadata } from '@/lib/seo';

export const metadata = generateRecentMetadata();

export const revalidate = 0;

export default async function RecentPage({
  searchParams
}: {
  searchParams: Promise<{ sort?: string }>
}) {
  const { sort } = await searchParams;

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

      <Suspense fallback={<RingtoneGridSkeleton count={6} />}>
        <RecentRingtonesList sort={sort} />
      </Suspense>
    </div>
  );
}
