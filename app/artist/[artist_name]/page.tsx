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
import { Ringtone } from '@/types';
import StructuredData from '@/components/StructuredData';

export async function generateMetadata({ params }: { params: Promise<{ artist_name: string }> }): Promise<Metadata> {
  const { artist_name } = await params;
  const artistName = decodeURIComponent(artist_name);
  
  // Use TMDB data for better metadata (cached by Next.js fetch revalidate)
  const person = await searchPerson(artistName);

  let role: 'singer' | 'music_director' | 'movie_director' = 'singer';
  if (person?.known_for_department === 'Sound' || person?.known_for_department === 'Composing') {
    role = 'music_director';
  } else if (person?.known_for_department === 'Directing') {
    role = 'movie_director';
  }

  return generateArtistMetadata({
    name: artistName,
    role,
    image_url: person?.profile_path || undefined
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

  // Fetch TMDB data first to determine artist type
  const person = await searchPerson(artistName);

  // Determine Artist Type (needed for role-specific search)
  let artistType = 'Singer'; // Default
  if (person?.known_for_department === 'Sound' || person?.known_for_department === 'Composing') {
    artistType = 'Music Director';
  } else if (person?.known_for_department === 'Directing') {
    artistType = 'Movie Director';
  } else if (person?.known_for_department === 'Acting') {
    artistType = 'Actor';
  } else if (person?.known_for_department === 'Writing') {
    artistType = 'Lyricist';
  }

  // ... (rest of the component logic)

  // Combined logic for search/bio
  // Query ringtones with role-specific filter
  let roleSpecificQuery;
  if (artistType === 'Actor') {
    roleSpecificQuery = `cast_members.ilike.%${artistName}%`;
  } else if (artistType === 'Music Director') {
    roleSpecificQuery = `music_director.ilike.%${artistName}%`;
  } else if (artistType === 'Movie Director') {
    roleSpecificQuery = `movie_director.ilike.%${artistName}%`;
  } else if (artistType === 'Lyricist') {
    roleSpecificQuery = `lyricist.ilike.%${artistName}%`;
  } else {
    roleSpecificQuery = `singers.ilike.%${artistName}%`;
  }

  const { data: ringtoneData } = await supabase
    .from('ringtones')
    .select('*')
    .eq('status', 'approved')
    .or(roleSpecificQuery)
    .limit(100);

  const searchLow = artistName.toLowerCase().trim();
  const ringtones = (ringtoneData || []).filter(r => {
    const checkMatch = (str: string | undefined | null) => {
      if (!str) return false;
      const parts = str.split(/[,&]|\band\b/i).map(s => s.trim().toLowerCase());
      return parts.includes(searchLow);
    };

    if (artistType === 'Actor') return checkMatch(r.cast_members);
    if (artistType === 'Music Director') return checkMatch(r.music_director);
    if (artistType === 'Movie Director') return checkMatch(r.movie_director);
    if (artistType === 'Lyricist') return checkMatch(r.lyricist);
    return checkMatch(r.singers);
  });

  let movieTitles: string[] = [];
  let actorMovieRingtones: Ringtone[] = [];

  if (artistType === 'Actor' && person) {
    try {
      const credits = await getPersonMovieCredits(person.id);
      if (credits?.cast) {
        movieTitles = credits.cast
          .sort((a, b) => new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime())
          .slice(0, 100)
          .map(m => m.title);

        if (movieTitles.length > 0) {
          const { data } = await supabase
            .from('ringtones')
            .select('*')
            .eq('status', 'approved')
            .in('movie_name', movieTitles)
            .limit(100);
          actorMovieRingtones = data || [];
        }
      }
    } catch (e) {
      console.error('Failed to fetch credits', e);
    }
  }

  const combined = [...ringtones, ...actorMovieRingtones];
  const uniqueMap = new Map();
  combined.forEach(item => uniqueMap.set(item.id, item));
  const allRingtones = Array.from(uniqueMap.values());

  const artistImage = person?.profile_path
    ? getImageUrl(person.profile_path, 'w185')
    : null;

  const artistBio = getArtistBio(artistName);

  if (allRingtones.length === 0) {
    notFound();
  }

  // Generate Structured Data
  const personSchema = generatePersonSchema({
    name: artistName,
    image_url: artistImage || undefined,
    role: artistType.toLowerCase().replace(' ', '_') as any,
    description: artistBio
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
      
      {/* Sticky Compact Profile Header - Loads Instantly */}
      <CompactProfileHeader
        name={artistName}
        type={artistType as 'Actor' | 'Singer' | 'Music Director' | 'Movie Director' | 'Lyricist' | 'Deity'}
        imageUrl={artistImage}
        bio={artistBio}
        shareMetadata={{
          title: `${artistName} Ringtones`,
          text: `Check out the best ringtones by ${artistName} on TamilRing!`
        }}
        ringCount={allRingtones.length}
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
          <ArtistRingtonesList
            artistName={artistName}
            sort={sort}
            view={view}
            additionalMovieNames={movieTitles}
          />
        </Suspense>
      </div>
    </div>
  );
}
