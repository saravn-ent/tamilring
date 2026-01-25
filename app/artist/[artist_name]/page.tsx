import { supabase } from '@/lib/supabaseClient';
export const revalidate = 3600;
import { searchPerson, getImageUrl } from '@/lib/tmdb';
import CompactProfileHeader from '@/components/CompactProfileHeader';
import SortControl from '@/components/SortControl';
import ViewToggle from '@/components/ViewToggle';
import { getArtistBio } from '@/lib/constants';
import { Metadata } from 'next';
import { generateArtistMetadata } from '@/lib/seo';
import ArtistRingtonesList from '@/components/artist/ArtistRingtonesList';
import { Suspense } from 'react';
import { RingtoneGridSkeleton } from '@/components/skeletons';

export async function generateMetadata({ params }: { params: Promise<{ artist_name: string }> }): Promise<Metadata> {
  const { artist_name } = await params;
  const artistName = decodeURIComponent(artist_name);

  // Basic metadata without heavy fetching
  return generateArtistMetadata({
    name: artistName,
    role: 'singer', // Default
    ringtone_count: 0
  });
}

export default async function ArtistPage({
  params,
  searchParams
}: {
  params: Promise<{ artist_name: string }>,
  searchParams: Promise<{ sort?: string; view?: string }>
}) {
  const { artist_name } = await params;
  const { sort, view } = await searchParams;
  const artistName = decodeURIComponent(artist_name);

  // Parallel fetch for Header Data (TMDB only, very fast)
  const personPromise = searchPerson(artistName);

  // We can optionally fetch a "fast count" here if we validly index it, 
  // but for now we skip to ensure sub-100ms TTFB.

  const person = await personPromise;

  const artistImage = person?.profile_path
    ? getImageUrl(person.profile_path, 'w185')
    : null; // Fallback handled in component

  // Get artist bio
  const artistBio = getArtistBio(artistName);

  // Determine Artist Type & Stats
  let artistType = 'Singer'; // Default
  if (person?.known_for_department === 'Sound' || person?.known_for_department === 'Composing') {
    artistType = 'Music Director';
  } else if (person?.known_for_department === 'Directing') {
    artistType = 'Movie Director';
  } else if (person?.known_for_department === 'Acting') {
    artistType = 'Actor';
  }

  return (
    <div className="max-w-md mx-auto pb-24">
      {/* Sticky Compact Profile Header - Loads Instantly */}
      <CompactProfileHeader
        name={artistName}
        type={artistType as any}
        ringtoneCount={0} // Loaded via streamed content ideally, or ignored for speed
        movieCount={0}
        totalLikes={0}
        imageUrl={artistImage}
        bio={artistBio}
        shareMetadata={{
          title: `${artistName} Ringtones`,
          text: `Check out the best ringtones by ${artistName} on TamilRing!`
        }}
      />

      {/* Sticky Controls Bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-border px-4 py-3 shadow-md flex items-center justify-between gap-2">
        <ViewToggle />
        <div className="flex justify-end">
          <SortControl />
        </div>
      </div>

      <div className="px-4 py-6">
        <Suspense fallback={<RingtoneGridSkeleton count={6} />}>
          <ArtistRingtonesList artistName={artistName} sort={sort} view={view} />
        </Suspense>
      </div>
    </div>
  );
}
