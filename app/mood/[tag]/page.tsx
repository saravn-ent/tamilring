import SortControl from '@/components/SortControl';
import MoodRingtonesList from '@/components/mood/MoodRingtonesList';
import { Suspense } from 'react';
import { RingtoneGridSkeleton } from '@/components/skeletons';
import BackButton from '@/components/BackButton';
import { supabase } from '@/lib/supabaseClient';
import { Metadata } from 'next';
import {
  generateMetadata as genMeta,
  generateBreadcrumbSchema,
  generateCollectionPageSchema,
  generateItemListSchema,
  combineSchemas
} from '@/lib/seo';
import StructuredData from '@/components/StructuredData';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const { tag: paramTag } = await params;
  const tag = decodeURIComponent(paramTag);

  return genMeta({
    title: `${tag} Tamil Ringtones`,
    description: `Download the best ${tag} Tamil ringtones. High-quality BGM, songs, and melodies for Android and iPhone. Free ${tag.toLowerCase()} ringtone download.`,
    keywords: [
      `${tag} ringtones`,
      `${tag} tamil ringtones`,
      `${tag} bgm ringtones`,
      `${tag} tamil bgm`,
      'tamil ringtones',
      'ringtone download',
    ],
    url: `/mood/${encodeURIComponent(tag)}`,
    type: 'website',
  });
}

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

  // Exact count query
  const { count } = await supabase
    .from('ringtones')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')
    .eq('mood', tag);

  // Fetch top ringtones for ItemList schema (Carousel rich results)
  const { data: topRingtones } = await supabase
    .from('ringtones')
    .select('title, slug, poster_url')
    .eq('status', 'approved')
    .eq('mood', tag)
    .order('downloads', { ascending: false })
    .limit(10);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/categories' },
    { name: `${tag} Ringtones`, url: `/mood/${encodeURIComponent(tag)}` },
  ]);

  const collectionPageSchema = generateCollectionPageSchema({
    name: `${tag} Tamil Ringtones`,
    description: `Download the best ${tag} Tamil ringtones. High-quality BGM, songs, and melodies for Android and iPhone.`,
    url: `/mood/${encodeURIComponent(tag)}`,
    numberOfItems: count || 0,
  });

  // ItemList schema — enables Google Carousel rich results for mood collection
  const itemListSchema = topRingtones?.length ? generateItemListSchema({
    name: `${tag} Tamil Ringtones`,
    description: `Download the best ${tag} Tamil ringtones. Free download for Android and iPhone.`,
    items: topRingtones.map(r => ({
      title: r.title,
      slug: r.slug,
      artwork_url: r.poster_url || undefined,
    })),
  }) : null;

  const combinedSchema = itemListSchema
    ? combineSchemas(collectionPageSchema, itemListSchema, breadcrumbSchema)
    : combineSchemas(collectionPageSchema, breadcrumbSchema);

  return (
    <div className="max-w-md mx-auto min-h-screen">
      <StructuredData data={combinedSchema} />

      <div className="p-6 pt-8 bg-linear-to-b from-emerald-500/10 via-m3-surface to-background flex items-center gap-4 border-b border-m3-outline-variant/20">
        <BackButton fallbackHref="/" className="!px-3 !py-2.5 shadow-sm" />
        <div>
          <h1 className="text-3xl font-display font-black text-m3-on-surface capitalize tracking-tight">{tag}</h1>
          <p className="text-m3-on-surface-variant text-sm mt-1 font-medium">Best {tag} Ringtones</p>
        </div>
      </div>

      <div className="px-4 -mt-2">
        <div className="flex justify-end mb-4 sticky top-0 z-30 bg-m3-surface/95 backdrop-blur-md py-2 -mx-4 px-4 border-b border-m3-outline-variant/30 shadow-xs">
          <SortControl />
        </div>

        <Suspense fallback={<RingtoneGridSkeleton count={6} />}>
          <MoodRingtonesList tag={tag} sort={sort} />
        </Suspense>
      </div>
    </div>
  );
}
