import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
export const revalidate = 3600;
import { searchPerson, getImageUrl, getPersonMovieCredits } from '@/lib/tmdb';
import CompactProfileHeader from '@/components/CompactProfileHeader';
import SortControl from '@/components/SortControl';
import ViewToggle from '@/components/ViewToggle';
import { getArtistBio } from '@/lib/constants';
import { Metadata } from 'next';
import { generateArtistMetadata, generatePersonSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/seo';
import ArtistRingtonesList from '@/components/artist/ArtistRingtonesList';
import { Suspense } from 'react';
import { RingtoneGridSkeleton } from '@/components/skeletons';
import StructuredData from '@/components/StructuredData';

type CompactProfileHeaderType = 'Actor' | 'Singer' | 'Music Director' | 'Movie Director' | 'Lyricist' | 'Deity';

function getArtistType(dept?: string): CompactProfileHeaderType {
  if (dept === 'Sound' || dept === 'Composing') return 'Music Director';
  if (dept === 'Directing') return 'Movie Director';
  if (dept === 'Acting') return 'Actor';
  if (dept === 'Writing') return 'Lyricist';
  return 'Singer';
}

export async function generateMetadata({ params }: { params: Promise<{ artist_name: string }> }): Promise<Metadata> {
  const { artist_name } = await params;
  const artistName = decodeURIComponent(artist_name);
  const person = await searchPerson(artistName);
  const role = getArtistType(person?.known_for_department).toLowerCase().replace(' ', '_') as 'singer' | 'music_director' | 'movie_director' | 'actor' | 'lyricist';
  return generateArtistMetadata({
    name: artistName,
    role,
    image_url: person?.profile_path || undefined
  });
}

// ─── Header Component (Suspense boundary) ────────────────────────────────────
// Fetches TMDB data independently; does NOT block the ringtone list from rendering
async function ArtistHeader({ artistName }: { artistName: string }) {
  const person = await searchPerson(artistName);
  const artistType = getArtistType(person?.known_for_department);
  const artistImage = person?.profile_path ? getImageUrl(person.profile_path, 'w185') : null;
  const artistBio = getArtistBio(artistName);

  // Count-only query — fast
  const { count } = await supabase
    .from('ringtones')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')
    .or(`singers.ilike.%${artistName}%,music_director.ilike.%${artistName}%,movie_director.ilike.%${artistName}%,cast_members.ilike.%${artistName}%,lyricist.ilike.%${artistName}%`);

  return (
    <CompactProfileHeader
      name={artistName}
      type={artistType}
      imageUrl={artistImage}
      bio={artistBio}
      shareMetadata={{
        title: `${artistName} Ringtones`,
        text: `Check out the best ringtones by ${artistName} on TamilRing!`
      }}
      ringCount={count || 0}
    />
  );
}

// ─── Ringtone List Wrapper (Suspense boundary) ────────────────────────────────
// Runs concurrently with ArtistHeader; Next.js dedupes the searchPerson fetch call
async function ArtistRingtonesWrapper({
  artistName,
  sort,
  view
}: {
  artistName: string;
  sort?: string;
  view?: string;
}) {
  const person = await searchPerson(artistName);
  const isActor = person?.known_for_department === 'Acting';

  let movieTitles: string[] = [];
  if (isActor && person) {
    const credits = await getPersonMovieCredits(person.id);
    if (credits?.cast) {
      movieTitles = credits.cast
        .filter(m => m.title)
        .sort((a, b) => new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime())
        .slice(0, 50)
        .map(m => m.title);
    }
  }

  return (
    <ArtistRingtonesList
      artistName={artistName}
      sort={sort}
      view={view}
      additionalMovieNames={movieTitles}
    />
  );
}

export default async function ArtistPage({
  params,
  searchParams
}: {
  params: Promise<{ artist_name: string }>;
  searchParams: Promise<{ sort?: string; view?: string }>;
}) {
  const { artist_name } = await params;
  const { sort, view } = await searchParams;
  const artistName = decodeURIComponent(artist_name);

  if (!artistName) notFound();

  // Lightweight SEO schemas — no external calls required
  const personSchema = generatePersonSchema({
    name: artistName,
    image_url: undefined,
    role: 'singer',
    description: undefined
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Artists', url: '/categories' },
    { name: artistName, url: `/artist/${encodeURIComponent(artistName)}` },
  ]);

  const combinedSchema = combineSchemas(personSchema, breadcrumbSchema);

  return (
    <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto pb-24">
      <StructuredData data={combinedSchema} />

      {/* Profile Header — streams in as TMDB resolves */}
      <Suspense fallback={
        <CompactProfileHeader
          name={artistName}
          type="Singer"
          imageUrl={null}
          ringCount={0}
        />
      }>
        <ArtistHeader artistName={artistName} />
      </Suspense>

      {/* Sticky Controls Bar — renders immediately, no data deps */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-border px-4 py-3 shadow-md flex items-center justify-between gap-2">
        <ViewToggle />
        <div className="flex justify-end">
          <SortControl />
        </div>
      </div>

      {/* Ringtone List — streams in concurrently with header */}
      <div className="px-4 py-6">
        <Suspense fallback={<RingtoneGridSkeleton count={6} />}>
          <ArtistRingtonesWrapper
            artistName={artistName}
            sort={sort}
            view={view}
          />
        </Suspense>
      </div>
    </div>
  );
}
