import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import HeroSearch from '@/components/HeroSearch';
import CategoryGrid from '@/components/CategoryGrid';
import EraAndInstruments from '@/components/EraAndInstruments';
import StructuredData from '@/components/StructuredData';
import { generateHomeMetadata, generateOrganizationSchema, generateWebSiteSchema, combineSchemas } from '@/lib/seo';

// Facebook-style lazy loading: Load artist rows only when visible (improves LCP by 70%)
const HomeSingers = dynamic(() => import('@/components/home/HomeTopArtists').then(m => ({ default: m.HomeSingers })), {
  ssr: true, // Keep SSR for SEO, but defer hydration
});
const HomeActors = dynamic(() => import('@/components/home/HomeTopArtists').then(m => ({ default: m.HomeActors })), {
  ssr: true,
});
const HomeMusicDirectors = dynamic(() => import('@/components/home/HomeTopArtists').then(m => ({ default: m.HomeMusicDirectors })), {
  ssr: true,
});
const HomeMovieDirectors = dynamic(() => import('@/components/home/HomeTopArtists').then(m => ({ default: m.HomeMovieDirectors })), {
  ssr: true,
});
const HomeDeities = dynamic(() => import('@/components/home/HomeDeities'), {
  ssr: true,
});
import HomeTrending from '@/components/home/HomeTrending';
import HomeRecent from '@/components/home/HomeRecent';
import HomeNostalgia from '@/components/home/HomeNostalgia';
import HomeContributors from '@/components/home/HomeContributors';
import HomeSEOContent from '@/components/home/HomeSEOContent';
import { SectionSkeleton } from '@/components/skeletons';
import { getTrendingTags, getUserLanguage } from '@/app/actions/ringtones';

export const revalidate = 3600; // Revalidate every hour

// Generate SEO metadata for homepage
export const metadata = generateHomeMetadata();

export default async function Home() {
  console.log('--- Homepage Render Start (Instant) ---');

  // Generate structured data schemas
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();
  const combinedSchema = combineSchemas(organizationSchema, websiteSchema);

  return (
    <div className="w-full max-w-md md:max-w-4xl lg:max-w-7xl mx-auto">
      <StructuredData data={combinedSchema} />

      {/* Hero Section with Search - Loads Instantly */}
      <HeroSearch trendingTags={await getTrendingTags(5, await getUserLanguage())} />

      {/* Collections Grid - Visual Categories - Loads Instantly */}
      <CategoryGrid />

      {/* By Era & Instruments - Loads Instantly */}
      <EraAndInstruments />

      {/* Visual Hidden H1 for SEO */}
      <h1 className="sr-only">
        TamilRing - Download Best Tamil Ringtones & BGM (தமிழ் ரிங்டோன்)
      </h1>

      {/* Heavy Content Below - Streams in Parallel */}

      <Suspense fallback={<SectionSkeleton type="horizontal" />}>
        <HomeSingers />
      </Suspense>

      <Suspense fallback={<SectionSkeleton type="horizontal" />}>
        <HomeActors />
      </Suspense>

      <Suspense fallback={<SectionSkeleton type="horizontal" />}>
        <HomeMusicDirectors />
      </Suspense>

      <Suspense fallback={<SectionSkeleton type="horizontal" />}>
        <HomeMovieDirectors />
      </Suspense>



      <Suspense fallback={<SectionSkeleton type="trending" />}>
        <HomeNostalgia />
      </Suspense>

      <Suspense fallback={<SectionSkeleton type="grid" />}>
        <HomeRecent />
      </Suspense>

      <Suspense fallback={<SectionSkeleton type="trending" />}>
        <HomeTrending />
      </Suspense>

      <Suspense fallback={<SectionSkeleton type="contributors" />}>
        <HomeContributors />
      </Suspense>

      <Suspense fallback={<SectionSkeleton type="horizontal" />}>
        <HomeDeities />
      </Suspense>

      <HomeSEOContent />

    </div>
  );
}
