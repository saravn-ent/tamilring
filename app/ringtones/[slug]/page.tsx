import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { COLLECTION_CONFIG_MAP, ALL_COLLECTION_SLUGS, RingtoneCollectionQuery } from '@/lib/collections';
import {
    generateMetadata as genMeta,
    generateBreadcrumbSchema,
    generateCollectionPageSchema,
    generateItemListSchema,
    combineSchemas
} from '@/lib/seo';
import StructuredData from '@/components/StructuredData';
import RingtoneCard from '@/components/RingtoneCard';
import { RingtoneGridSkeleton } from '@/components/skeletons';
import BackButton from '@/components/BackButton';
import { ArrowRight, Music2 } from 'lucide-react';
import { Ringtone } from '@/types';

export const revalidate = 3600;

// Pre-render all known collection slugs at build time
export function generateStaticParams() {
    return ALL_COLLECTION_SLUGS.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const config = COLLECTION_CONFIG_MAP.get(slug);
    if (!config) return { title: 'Collection Not Found | TamilRing' };

    return genMeta({
        title: config.metaTitle,
        description: config.description,
        keywords: config.keywords,
        url: `/ringtones/${slug}`,
        type: 'website',
    });
}

// ─── Data Fetching ────────────────────────────────────────────────────────────

async function fetchByQuery(query: RingtoneCollectionQuery, limit = 48): Promise<Ringtone[]> {
    let q = supabase.from('ringtones').select('*').eq('status', 'approved');

    switch (query.type) {
        case 'music_director':
            q = q.ilike('music_director', `%${query.value}%`);
            break;
        case 'mood':
            q = q.eq('mood', query.value);
            break;
        case 'year':
            q = q.eq('movie_year', query.value);
            break;
        case 'tags':
            q = q.contains('tags', [query.value]);
            break;
        case 'era':
            q = q
                .gte('movie_year', String(query.startYear))
                .lte('movie_year', String(query.endYear));
            break;
    }

    const { data } = await q.order('downloads', { ascending: false }).limit(limit);
    return (data as Ringtone[]) || [];
}

// ─── Related Collections Component ───────────────────────────────────────────

function RelatedCollections({ slugs }: { slugs: string[] }) {
    const related = slugs
        .map(s => COLLECTION_CONFIG_MAP.get(s))
        .filter(Boolean) as ReturnType<typeof COLLECTION_CONFIG_MAP.get>[];

    if (!related.length) return null;

    return (
        <section className="mt-10">
            <h2 className="text-sm font-bold text-m3-on-surface-variant uppercase tracking-widest mb-3">
                Related Collections
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {related.map(cfg => cfg && (
                    <Link
                        key={cfg.slug}
                        href={`/ringtones/${cfg.slug}`}
                        className="flex items-center gap-2 p-3 rounded-xl bg-m3-surface-container border border-m3-outline-variant/30 hover:border-m3-primary/40 hover:bg-m3-surface-container-high transition-all group"
                    >
                        <Music2 size={14} className="text-m3-primary shrink-0" />
                        <span className="text-xs font-semibold text-m3-on-surface group-hover:text-m3-primary transition-colors line-clamp-2 leading-snug">
                            {cfg.title}
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
}

// ─── Ringtones Grid ───────────────────────────────────────────────────────────

async function CollectionGrid({ query }: { query: RingtoneCollectionQuery }) {
    const ringtones = await fetchByQuery(query);

    if (!ringtones.length) {
        return (
            <div className="text-center py-16 text-m3-on-surface-variant">
                <Music2 size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No ringtones found yet.</p>
                <p className="text-xs mt-1 opacity-60">Check back soon — we update daily.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {ringtones.map(ringtone => (
                <RingtoneCard key={ringtone.id} ringtone={ringtone} />
            ))}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const config = COLLECTION_CONFIG_MAP.get(slug);
    if (!config) notFound();

    // Fetch top 10 for structured data, then the full grid renders via Suspense
    const topRingtones = await fetchByQuery(config.query, 10);

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Ringtones', url: '/categories' },
        { name: config.title, url: `/ringtones/${slug}` },
    ]);

    const collectionPageSchema = generateCollectionPageSchema({
        name: config.title,
        description: config.description,
        url: `/ringtones/${slug}`,
        numberOfItems: topRingtones.length,
    });

    const itemListSchema = topRingtones.length ? generateItemListSchema({
        name: config.title,
        description: config.description,
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
        <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 pb-28 pt-4">
            <StructuredData data={combinedSchema} />

            {/* Breadcrumb nav */}
            <nav className="flex items-center gap-1.5 text-xs text-m3-on-surface-variant mb-5" aria-label="Breadcrumb">
                <Link href="/" className="hover:text-m3-primary transition-colors">Home</Link>
                <ArrowRight size={10} />
                <Link href="/categories" className="hover:text-m3-primary transition-colors">Ringtones</Link>
                <ArrowRight size={10} />
                <span className="text-m3-on-surface font-medium truncate">{config.title}</span>
            </nav>

            {/* Hero Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                    <BackButton fallbackHref="/categories" variant="minimal" className="bg-m3-surface-container! rounded-full" />
                    <span className="px-2.5 py-1 rounded-full bg-m3-primary-container text-m3-primary text-[10px] font-bold uppercase tracking-widest">
                        {config.heroLabel}
                    </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-m3-on-surface tracking-tight leading-tight mb-2">
                    {config.title}
                </h1>
                <p className="text-sm text-m3-on-surface-variant leading-relaxed max-w-xl">
                    {config.description}
                </p>

                {/* Link to canonical artist page if applicable */}
                {config.canonicalArtistHref && (
                    <Link
                        href={config.canonicalArtistHref}
                        className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-m3-primary hover:underline"
                    >
                        View full {config.title.split(' ')[0]} discography
                        <ArrowRight size={12} />
                    </Link>
                )}
            </div>

            {/* Download format badge */}
            <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-[11px] font-bold">
                    🤖 MP3 for Android
                </span>
                <span className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                    🍎 M4R for iPhone
                </span>
            </div>

            {/* Ringtones Grid */}
            <Suspense fallback={<RingtoneGridSkeleton count={6} />}>
                <CollectionGrid query={config.query} />
            </Suspense>

            {/* Related Collections */}
            <RelatedCollections slugs={config.relatedSlugs} />

            {/* AEO Paragraph */}
            <div className="mt-10 p-4 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/20 text-xs text-m3-on-surface-variant leading-relaxed">
                <strong className="text-m3-on-surface">About this collection: </strong>
                {config.description} All ringtones are free to download in dual formats —{' '}
                <strong>MP3 for Android</strong> and <strong>M4R for iPhone</strong> — directly from TamilRing.
                Use our <Link href="/tools/cutter" className="text-m3-primary hover:underline font-medium">free MP3 Cutter</Link> to
                trim any ringtone to the exact length you want, or{' '}
                <Link href="/iphone-ringtone-guide" className="text-m3-primary hover:underline font-medium">
                    follow our iPhone setup guide
                </Link>{' '}
                to set it as your ringtone.
            </div>
        </div>
    );
}
