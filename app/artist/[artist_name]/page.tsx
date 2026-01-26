import { supabase } from '@/lib/supabaseClient';
export const revalidate = 3600;
import { searchPerson, getImageUrl, getPersonMovieCredits } from '@/lib/tmdb';
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

  // Build role-specific query to avoid name collisions
  // (e.g., "Vivek" the actor vs "Vivek" the lyricist)
  let roleSpecificQuery;
  if (artistType === 'Actor') {
    // For actors, only search cast_members (we'll add movie-based ringtones separately)
    roleSpecificQuery = `cast_members.ilike.%${artistName}%`;
  } else if (artistType === 'Music Director') {
    roleSpecificQuery = `music_director.ilike.%${artistName}%`;
  } else if (artistType === 'Movie Director') {
    roleSpecificQuery = `movie_director.ilike.%${artistName}%`;
  } else if (artistType === 'Lyricist') {
    roleSpecificQuery = `lyricist.ilike.%${artistName}%`;
  } else {
    // Singer or unknown - search singers field
    roleSpecificQuery = `singers.ilike.%${artistName}%`;
  }

  // Query ringtones with role-specific filter
  const { data: ringtoneData } = await supabase
    .from('ringtones')
    .select('*')
    .eq('status', 'approved')
    .or(roleSpecificQuery)
    .limit(100);

  // Filter precisely
  const searchLow = artistName.toLowerCase().trim();
  const ringtones = (ringtoneData || []).filter(r => {
    const checkMatch = (str: string | undefined | null) => {
      if (!str) return false;
      const parts = str.split(/[,&]|\band\b/i).map(s => s.trim().toLowerCase());
      return parts.includes(searchLow);
    };

    // Only check the role-specific field
    if (artistType === 'Actor') {
      return checkMatch(r.cast_members);
    } else if (artistType === 'Music Director') {
      return checkMatch(r.music_director);
    } else if (artistType === 'Movie Director') {
      return checkMatch(r.movie_director);
    } else if (artistType === 'Lyricist') {
      return checkMatch(r.lyricist);
    } else {
      return checkMatch(r.singers);
    }
  });

  // If Actor, fetch movie credits to find additional ringtones by movie association
  let movieTitles: string[] = [];
  let actorMovieRingtones: any[] = [];

  if (artistType === 'Actor' && person) {
    try {
      const credits = await getPersonMovieCredits(person.id);
      if (credits?.cast) {
        movieTitles = credits.cast
          .sort((a, b) => new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime())
          .slice(0, 100)
          .map(m => m.title);

        // Fetch ringtones from actor's movies
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

  // Merge and deduplicate ringtones (same logic as ArtistRingtonesList)
  const combined = [...ringtones, ...actorMovieRingtones];
  const uniqueMap = new Map();
  combined.forEach(item => uniqueMap.set(item.id, item));
  const allRingtones = Array.from(uniqueMap.values());

  const artistImage = person?.profile_path
    ? getImageUrl(person.profile_path, 'w185')
    : null;

  // Get artist bio
  const artistBio = getArtistBio(artistName);

  return (
    <div className="max-w-md mx-auto pb-24">
      {/* Sticky Compact Profile Header - Loads Instantly */}
      <CompactProfileHeader
        name={artistName}
        type={artistType as any}
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
