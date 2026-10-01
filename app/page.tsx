import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import HeroSpotlightServer from '@/components/home/HeroSpotlightServer';
import HomeTrending from '@/components/home/HomeTrending';
import CategoryGrid from '@/components/CategoryGrid';
import EraTimeline from '@/components/home/EraTimeline';
import AudioTrustBadge from '@/components/home/AudioTrustBadge';
import StructuredData from '@/components/StructuredData';
import { combineSchemas, generateHomeMetadata, generateOrganizationSchema, generateWebSiteSchema } from '@/lib/seo';
import { SectionSkeleton } from '@/components/skeletons';

// Dynamic Universal Homepage Components
const HomeMaestros = dynamic<{ lang: string }>(() => import('@/components/home/HomeMaestros'), {
  ssr: true,
  loading: () => <SectionSkeleton type="horizontal" />
});
const HomeNewReleases = dynamic<{ lang: string }>(() => import('@/components/home/HomeNewReleases'), {
  ssr: true,
  loading: () => <SectionSkeleton type="horizontal" />
});
const HomeDeities = dynamic<{ lang: string }>(() => import('@/components/home/HomeDeities'), {
  ssr: true,
  loading: () => <SectionSkeleton type="horizontal" />
});
const HomeSEOContent = dynamic(() => import('@/components/home/HomeSEOContent'), { ssr: true });

export const revalidate = 3600; // Revalidate every hour

// Generate SEO metadata for homepage
export const metadata = generateHomeMetadata();

export default async function Home() {
  const lang = 'tamil';

  // Structured data
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();
  const combinedSchema = combineSchemas(organizationSchema, websiteSchema);

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
      <StructuredData data={combinedSchema} />

      {/* Visually Hidden H1 for SEO */}
      <h1 className="sr-only">
        TamilRing - Download Best Tamil Ringtones & BGM
      </h1>

      {/* 1. CINEMA AUDIO SPOTLIGHT (Daily Featured Cinema Cut) */}
      <HeroSpotlightServer lang={lang} />

      {/* 2. NOW IN THEATERS & NEW DROPS (The Theatrical Wave) */}
      <div className="lazy-section">
        <Suspense fallback={<SectionSkeleton type="horizontal" />}>
          <HomeNewReleases lang={lang} />
        </Suspense>
      </div>

      {/* 3. TRENDING RINGTONES (Viral BGM & Interval Hits - Full 2:3 Movie Posters) */}
      <div className="lazy-section">
        <HomeTrending lang={lang} />
      </div>

      {/* 4. HALL OF MAESTROS (Composers: Anirudh, ARR, Raja - Circular Avatars) */}
      <div className="lazy-section">
        <Suspense fallback={<SectionSkeleton type="horizontal" />}>
          <HomeMaestros lang={lang} />
        </Suspense>
      </div>

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

      {/* 9. SEO & FAQ FOOTPRINT */}
      <div className="lazy-section">
        <HomeSEOContent />
      </div>
    </div>
  );
}
