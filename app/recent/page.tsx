import SortControl from '@/components/SortControl';
import RecentRingtonesList from '@/components/recent/RecentRingtonesList';
import { Suspense } from 'react';
import { RingtoneGridSkeleton } from '@/components/skeletons';
import BackButton from '@/components/BackButton';

import { generateRecentMetadata, generateBreadcrumbSchema } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';

export const metadata = generateRecentMetadata();

export const revalidate = 0;

export default async function RecentPage({
  searchParams
}: {
  searchParams: Promise<{ sort?: string; page?: string }>
}) {
  const { sort, page } = await searchParams;
  const currentPage = page ? parseInt(page) : 1;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Recently Added', url: '/recent' },
  ]);

  return (
    <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto p-4 pb-24">
      <StructuredData data={breadcrumbSchema} />
      <header className="flex items-center gap-4 py-4 mb-3">
        <BackButton fallbackHref="/" variant="minimal" className="bg-zinc-100! rounded-full" />
        <h1 className="text-xl font-black text-zinc-900">Just Added</h1>
      </header>

      <div className="flex justify-end mb-4">
        <SortControl />
      </div>

      <Suspense fallback={<RingtoneGridSkeleton count={6} />}>
        <RecentRingtonesList sort={sort} page={currentPage} />
      </Suspense>
    </div>
  );
}
