import { supabase } from '@/lib/supabaseClient';
export const revalidate = 3600;
import CompactProfileHeader from '@/components/CompactProfileHeader';
import SortControl from '@/components/SortControl';
import { Metadata } from 'next';
import { generateDeityMetadata, generateBreadcrumbSchema, generateItemListSchema, generateCollectionPageSchema, combineSchemas } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';
import DeityRingtonesList from '@/components/devotional/DeityRingtonesList';
import { Suspense } from 'react';
import { RingtoneGridSkeleton } from '@/components/skeletons';

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
    const { name } = await params;
    const deityName = decodeURIComponent(name);

    // 1. Try fetching from manual deity_images
    const { data: manualImage } = await supabase
        .from('deity_images')
        .select('image_url')
        .eq('deity_name', deityName)
        .single();

    let imageUrl = manualImage?.image_url;

    // 2. Fallback to ringtone poster if no manual image
    if (!imageUrl) {
        const { data } = await supabase
            .from('ringtones')
            .select('poster_url')
            .eq('status', 'approved')
            .eq('movie_name', deityName)
            .contains('tags', ['Devotional'])
            .limit(1);

        imageUrl = data?.[0]?.poster_url;
    }

    return generateDeityMetadata({
        name: deityName,
        image_url: imageUrl || undefined,
    });
}

export default async function DeityPage({
    params,
    searchParams
}: {
    params: Promise<{ name: string }>,
    searchParams: Promise<{ sort?: string; }>
}) {
    const { name } = await params;
    const { sort } = await searchParams;
    const deityName = decodeURIComponent(name);

    // 1. Try fetching from manual deity_images
    const { data: manualImage } = await supabase
        .from('deity_images')
        .select('image_url')
        .eq('deity_name', deityName)
        .single();

    let imageUrl = manualImage?.image_url;

    // 2. Fallback to ringtone poster if no manual image
    if (!imageUrl) {
        const { data } = await supabase
            .from('ringtones')
            .select('poster_url')
            .eq('status', 'approved')
            .eq('movie_name', deityName)
            .contains('tags', ['Devotional'])
            .limit(1);

        imageUrl = data?.[0]?.poster_url;
    }

    // Quick count query
    const { count } = await supabase
        .from('ringtones')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .eq('movie_name', deityName)
        .contains('tags', ['Devotional']);

    const ringCount = count || 0;

    // Fetch top ringtones for ItemList schema (Carousel rich results)
    const { data: topRingtones } = await supabase
        .from('ringtones')
        .select('title, slug')
        .eq('status', 'approved')
        .contains('tags', ['Devotional'])
        .eq('movie_name', deityName)
        .order('downloads', { ascending: false })
        .limit(10);

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Devotional', url: '/categories' },
        { name: deityName, url: `/devotional/${encodeURIComponent(deityName)}` },
    ]);

    const collectionPageSchema = generateCollectionPageSchema({
        name: `${deityName} Devotional Ringtones`,
        description: `Download Tamil devotional ringtones dedicated to ${deityName}. Divine songs and slogams for Android and iPhone.`,
        url: `/devotional/${encodeURIComponent(deityName)}`,
        numberOfItems: ringCount,
    });

    // ItemList schema — enables Google Carousel rich results for devotional collection
    const itemListSchema = topRingtones?.length ? generateItemListSchema({
        name: `${deityName} Ringtones`,
        description: `Download Tamil devotional ringtones dedicated to ${deityName}.`,
        items: topRingtones.map(r => ({ title: r.title, slug: r.slug })),
    }) : null;

    const combinedSchema = itemListSchema
        ? combineSchemas(collectionPageSchema, itemListSchema, breadcrumbSchema)
        : combineSchemas(collectionPageSchema, breadcrumbSchema);

    return (
        <div className="max-w-md mx-auto pb-24">
            <StructuredData data={combinedSchema} />
            {/* Sticky Compact Profile Header - Loads Instantly */}
            <CompactProfileHeader
                name={deityName}
                type="Deity"
                imageUrl={imageUrl}
                shareMetadata={{
                    title: `${deityName} Ringtones`,
                    text: `Check out divine ringtones for ${deityName} on TamilRing!`
                }}
                ringCount={ringCount}
            />

            {/* Sticky Controls Bar - Minimal, no View Toggle as it's not needed for Deities usually */}
            <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-border px-4 py-3 shadow-md flex items-center justify-end gap-2">
                <SortControl />
            </div>

            <div className="px-4 py-6">
                <Suspense fallback={<RingtoneGridSkeleton count={6} />}>
                    <DeityRingtonesList
                        deityName={deityName}
                        sort={sort}
                    />
                </Suspense>
            </div>
        </div>
    );
}
