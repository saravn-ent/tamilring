import { Suspense } from 'react';
import HeroSearch from '@/components/HeroSearch';
import CategoryGrid from '@/components/CategoryGrid';
import EraAndInstruments from '@/components/EraAndInstruments';
import StructuredData from '@/components/StructuredData';
import { generateHomeMetadata, generateOrganizationSchema, generateWebSiteSchema, combineSchemas } from '@/lib/seo';
import HomeTopArtists from '@/components/home/HomeTopArtists';
import HomeTrending from '@/components/home/HomeTrending';
import HomeRecent from '@/components/home/HomeRecent';
import HomeNostalgia from '@/components/home/HomeNostalgia';
import HomeContributors from '@/components/home/HomeContributors';
import { SectionSkeleton } from '@/components/skeletons';

export const revalidate = 3600; // Revalidate every hour

// Generate SEO metadata for homepage
export const metadata = generateHomeMetadata();

export default function Home() {
  console.log('--- Homepage Render Start (Instant) ---');

  // Generate structured data schemas
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();
  const combinedSchema = combineSchemas(organizationSchema, websiteSchema);

  return (
    <div className="w-full max-w-md md:max-w-4xl lg:max-w-7xl mx-auto pb-20">
      <StructuredData data={combinedSchema} />

      {/* Hero Section with Search - Loads Instantly */}
      <HeroSearch />

      {/* Collections Grid - Visual Categories - Loads Instantly */}
      <CategoryGrid />

      {/* By Era & Instruments - Loads Instantly */}
      <EraAndInstruments />

      {/* Visual Hidden H1 for SEO */}
      <h1 className="sr-only">
        TamilRing - Download Best Tamil Ringtones & BGM (தமிழ் ரிங்டோன்)
      </h1>

      {/* Heavy Content Below - Streams in Parallel */}

      <Suspense fallback={<SectionSkeleton />}>
        <HomeTopArtists />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <HomeNostalgia />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <HomeRecent />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <HomeTrending />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <HomeContributors />
      </Suspense>

    </div>
  );
}
