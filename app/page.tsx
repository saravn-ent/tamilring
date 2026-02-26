import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import HeroSearchServer from '@/components/HeroSearchServer';
import CategoryGrid from '@/components/CategoryGrid';
import EraAndInstruments from '@/components/EraAndInstruments';
import StructuredData from '@/components/StructuredData';
import { combineSchemas, generateHomeMetadata, generateOrganizationSchema, generateWebSiteSchema } from '@/lib/seo';

// Homepage Row Components
const HomeSingers = dynamic<{ lang: string }>(() => import('@/components/home/HomeTopArtists').then(m => m.HomeSingers), { ssr: true });
const HomeActors = dynamic<{ lang: string }>(() => import('@/components/home/HomeTopArtists').then(m => m.HomeActors), { ssr: true });
const HomeMusicDirectors = dynamic<{ lang: string }>(() => import('@/components/home/HomeTopArtists').then(m => m.HomeMusicDirectors), { ssr: true });
const HomeMovieDirectors = dynamic<{ lang: string }>(() => import('@/components/home/HomeTopArtists').then(m => m.HomeMovieDirectors), { ssr: true });
const HomeDeities = dynamic<{ lang: string }>(() => import('@/components/home/HomeDeities'), { ssr: true });
const HomeLikedSongs = dynamic(() => import('@/components/home/HomeLikedSongs'));
import HomeTrending from '@/components/home/HomeTrending';
const HomeNewReleases = dynamic<{ lang: string }>(() => import('@/components/home/HomeNewReleases'), { ssr: true });
const HomeNostalgia = dynamic<{ lang: string }>(() => import('@/components/home/HomeNostalgia'), { ssr: true });
const HomeSEOContent = dynamic(() => import('@/components/home/HomeSEOContent'), { ssr: true });

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

      {/* Hero Section with Search */}
      <HeroSearchServer />

      {/* Liked Songs - User's Personal Collection - HIGHER PRIORITY */}
      <div className="lazy-section">
        <HomeLikedSongs />
      </div>

      {/* Collections Grid - Visual Categories */}
      <CategoryGrid />

      {/* By Era & Instruments */}
      <EraAndInstruments />

      <div className="lazy-section">
        <HomeTrending lang={lang} />
      </div>

      <div className="lazy-section">
        <Suspense fallback={<SectionSkeleton type="trending" />}>
          <HomeNostalgia lang={lang} />
        </Suspense>
      </div>

      <div className="lazy-section">
        <Suspense fallback={<SectionSkeleton type="horizontal" />}>
          <HomeSingers lang={lang} />
        </Suspense>
      </div>

      <div className="lazy-section">
        <Suspense fallback={<SectionSkeleton type="horizontal" />}>
          <HomeActors lang={lang} />
        </Suspense>
      </div>

      <div className="lazy-section">
        <Suspense fallback={<SectionSkeleton type="horizontal" />}>
          <HomeMusicDirectors lang={lang} />
        </Suspense>
      </div>

      <div className="lazy-section">
        <Suspense fallback={<SectionSkeleton type="horizontal" />}>
          <HomeMovieDirectors lang={lang} />
        </Suspense>
      </div>

      <div className="lazy-section">
        <Suspense fallback={<SectionSkeleton type="horizontal" />}>
          <HomeNewReleases lang={lang} />
        </Suspense>
      </div>



      <div className="lazy-section">
        <Suspense fallback={<SectionSkeleton type="horizontal" />}>
          <HomeDeities lang={lang} />
        </Suspense>
      </div>

      <div className="lazy-section">
        <HomeSEOContent />
      </div>
    </div>
  );
}
