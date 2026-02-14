import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import HeroSearchServer from '@/components/HeroSearchServer';
import CategoryGrid from '@/components/CategoryGrid';
import EraAndInstruments from '@/components/EraAndInstruments';
import StructuredData from '@/components/StructuredData';
import { generateHomeMetadata, generateOrganizationSchema, generateWebSiteSchema, combineSchemas } from '@/lib/seo';
import { getUserLanguage } from '@/app/actions/ringtones';

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
import { HeroSearchSkeleton } from '@/components/HeroSearchSkeleton';

export const revalidate = 3600; // Revalidate every hour

// Generate SEO metadata for homepage
export const metadata = generateHomeMetadata();

export default async function Home() {
  console.log('--- Homepage Render Start (Instant Shell) ---');

  // 1. Get user language (Hardcoded for static speed test)
  const lang = 'tamil'; // await getUserLanguage();

  // 2. Prepare structured data
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();
  const combinedSchema = combineSchemas(organizationSchema, websiteSchema);

  return (
    <div className="w-full max-w-md md:max-w-4xl lg:max-w-7xl mx-auto">
      <StructuredData data={combinedSchema} />

      {/* Visual Hidden H1 for SEO */}
      <h1 className="sr-only">
        TamilRing - Download Best Tamil Ringtones & BGM (தமிழ் ரிங்டோன்)
      </h1>

      {/* 
         CRITICAL: No top-level awaits below this point ensures the Shell 
         (Header/Nav) is sent to the browser immediately while rows stream in.
      */}

      {/* Hero Section with Search - Loads via Suspense */}
      <Suspense fallback={<HeroSearchSkeleton />}>
        <HeroSearchServer />
      </Suspense>

      {/* Collections Grid - Visual Categories - Loads Instantly */}
      <CategoryGrid />

      {/* By Era & Instruments - Loads Instantly */}
      <EraAndInstruments />

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

      <Suspense fallback={<SectionSkeleton type="trending" />}>
        <HomeTrending lang={lang} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton type="contributors" />}>
        <HomeContributors />
      </Suspense>

      <Suspense fallback={<SectionSkeleton type="horizontal" />}>
        <HomeDeities lang={lang} />
      </Suspense>

      <HomeSEOContent />
    </div>
  );
}
