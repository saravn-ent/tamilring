import { Suspense } from 'react';
import HeroSpotlightServer from '@/components/home/HeroSpotlightServer';
import HomeTrending from '@/components/home/HomeTrending';
import CategoryGrid from '@/components/CategoryGrid';
import EraTimeline from '@/components/home/EraTimeline';
import AudioTrustBadge from '@/components/home/AudioTrustBadge';
import StructuredData from '@/components/StructuredData';
import { generateHomeMetadata, generateItemListSchema } from '@/lib/seo';
import { getTrendingRingtones } from '@/app/actions/ringtones';
import { SectionSkeleton } from '@/components/skeletons';

import HomeMaestros from '@/components/home/HomeMaestros';
import HomeNewReleases from '@/components/home/HomeNewReleases';
import HomeDeities from '@/components/home/HomeDeities';
import HomeSEOContent from '@/components/home/HomeSEOContent';

export const revalidate = 3600; // Revalidate every hour

// Generate SEO metadata for homepage
export const metadata = generateHomeMetadata();

export default async function Home() {
  const lang = 'tamil';

  // Fetch top trending ringtones for ItemList structured data (matches HomeTrending)
  const trending = await getTrendingRingtones(12, lang);

  // Structured data (Organization & WebSite schemas are provided globally in RootLayout)
  const itemListSchema = trending?.length
    ? generateItemListSchema({
        name: 'Trending Tamil Ringtones & BGM',
        description: 'Top trending Tamil movie ringtones, viral BGM, and interval hits.',
        items: trending.map(r => ({
          title: r.title,
          slug: r.slug,
          artwork_url: r.artwork_url || r.poster_url,
        })),
      })
    : null;

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
      {itemListSchema && <StructuredData data={itemListSchema} />}

      {/* Visually Hidden H1 for SEO */}
      <h1 className="sr-only">
        TamilRing - Download Best Tamil Ringtones & BGM
      </h1>

      {/* 1. CINEMA AUDIO SPOTLIGHT (Daily Featured Cinema Cut) */}
      <HeroSpotlightServer lang={lang} />

      {/* 2. NOW IN THEATERS & NEW DROPS (The Theatrical Wave) */}
      <Suspense fallback={<SectionSkeleton type="horizontal" />}>
        <HomeNewReleases lang={lang} />
      </Suspense>

      {/* 3. TRENDING RINGTONES (Viral BGM & Interval Hits - Full 2:3 Movie Posters) */}
      <HomeTrending lang={lang} />

      {/* 4. HALL OF MAESTROS (Composers: Anirudh, ARR, Raja - Circular Avatars) */}
      <Suspense fallback={<SectionSkeleton type="horizontal" />}>
        <HomeMaestros lang={lang} />
      </Suspense>

      {/* 5. CURATED MOOD STATIONS (Tactile Colorful Gradient Capsules) */}
      <CategoryGrid />

      {/* 6. DECADES OF KOLLEGEWOOD (Backward Timeline: 2020s → 70s) */}
      <EraTimeline />

      {/* 7. BHAKTHI & SPIRITUAL (Divine Deity Collections) */}
      <div className="lazy-section">
        <Suspense fallback={<SectionSkeleton type="horizontal" />}>
          <HomeDeities lang={lang} />
        </Suspense>
      </div>

      {/* 8. SUBTLE DUAL-OS TRUST & QUALITY PLEDGE */}
      <AudioTrustBadge />

      {/* 9. POPULAR SEARCHES DIRECTORY */}
      <div className="lazy-section">
        <HomeSEOContent />
      </div>
    </div>
  );
}
