import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import HeroSearchServer from '@/components/HeroSearchServer';
import CategoryGrid from '@/components/CategoryGrid';
import EraAndInstruments from '@/components/EraAndInstruments';
import StructuredData from '@/components/StructuredData';
import { combineSchemas, generateHomeMetadata, generateOrganizationSchema, generateWebSiteSchema } from '@/lib/seo';

// Homepage Row Components
import { HomeSingers, HomeActors, HomeMusicDirectors, HomeMovieDirectors } from '@/components/home/HomeTopArtists';
const HomeDeities = dynamic(() => import('@/components/home/HomeDeities'), {
  ssr: true,
});
import HomeTrending from '@/components/home/HomeTrending';
import HomeRecent from '@/components/home/HomeRecent';
import HomeNostalgia from '@/components/home/HomeNostalgia';
import HomeContributors from '@/components/home/HomeContributors';
import HomeSEOContent from '@/components/home/HomeSEOContent';
import { SectionSkeleton } from '@/components/skeletons';


export const revalidate = 3600; // Revalidate every hour

// Generate SEO metadata for homepage
export const metadata = generateHomeMetadata();

export default async function Home() {
  console.log('--- Homepage Render Start (Instant Shell) ---');

  // 1. Content Language (We show Tamil content by default on TamilRing, even if UI is English)
  const lang = 'tamil';

  // 2. Prepare structured data
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();
  const combinedSchema = combineSchemas(organizationSchema, websiteSchema);

  return (
    <div className="w-full max-w-md md:max-w-4xl lg:max-w-7xl mx-auto">
      <StructuredData data={combinedSchema} />

      {/* Visual Hidden H1 for SEO */}
      <h1 className="sr-only">
        TamilRing - Download Best Tamil Ringtones & BGM
      </h1>

      {/* 
         CRITICAL: No top-level awaits below this point ensures the Shell 
         (Header/Nav) is sent to the browser immediately while rows stream in.
      */}

      {/* Hero Section with Search - Loads Instantly (Static Shell) */}
      <HeroSearchServer />

      {/* Collections Grid - Visual Categories - Loads Instantly */}
      <CategoryGrid />

      {/* By Era & Instruments - Loads Instantly */}
      <EraAndInstruments />

      <Suspense fallback={<SectionSkeleton type="trending" />}>
        <HomeTrending lang={lang} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton type="trending" />}>
        <HomeNostalgia lang={lang} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton type="horizontal" />}>
        <HomeSingers lang={lang} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton type="horizontal" />}>
        <HomeActors lang={lang} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton type="horizontal" />}>
        <HomeMusicDirectors lang={lang} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton type="horizontal" />}>
        <HomeMovieDirectors lang={lang} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton type="grid" />}>
        <HomeRecent lang={lang} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton type="contributors" />}>
        <HomeContributors lang={lang} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton type="horizontal" />}>
        <HomeDeities lang={lang} />
      </Suspense>

      <HomeSEOContent />
    </div>
  );
}
