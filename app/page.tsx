import { supabase } from '@/lib/supabaseClient';
import { searchPerson, getImageUrl } from '@/lib/tmdb';
import RingtoneCard from '@/components/RingtoneCard';
import SectionHeader from '@/components/SectionHeader';
import HeroCard from '@/components/HeroCard';
import HeroSlider from '@/components/HeroSlider';
import ImageWithFallback from '@/components/ImageWithFallback';
import Link from 'next/link';
import Image from 'next/image';
import { Mic, Clapperboard, User } from 'lucide-react';
import { MOODS, COLLECTIONS } from '@/lib/constants';
import { Ringtone } from '@/types';
import { unstable_cache } from 'next/cache';
import { splitArtists } from '@/lib/utils';
import { getLevelTitle } from '@/lib/gamification';
import AvatarRank from '@/components/AvatarRank';

export const dynamic = 'force-dynamic';

const getTopArtists = unstable_cache(
  async () => {
    // 1. Fix Content Leak: Filter by 'approved' status
    const { data } = await supabase
      .from('ringtones')
      .select('singers, music_director, movie_director, likes')
      .eq('status', 'approved');

    if (!data) return { topSingers: [], topMusicDirectors: [], topMovieDirectors: [] };

    const normalize = (n: string) =>
      n
        .replace(/\(.*?\)/g, '') // remove parenthetical notes
        .replace(/\./g, '') // remove dots
        .replace(/[^a-z0-9\s]/gi, '') // remove punctuation
        .replace(/\b(music|director|composer|singer|vocals|vocal|feat|ft)\b/gi, '') // remove role words
        .replace(/\s+/g, ' ') // collapse spaces
        .trim()
        .toLowerCase();

    // Build a set of normalized director names (music + movie) to exclude from singer aggregation
    const directorSet = new Set<string>();
    data.forEach((row: any) => {
      if (row.music_director) {
        splitArtists(row.music_director).forEach((d: string) => {
          const n = normalize(d);
          if (n) directorSet.add(n);
        });
      }
      if (row.movie_director) {
        splitArtists(row.movie_director).forEach((d: string) => {
          const n = normalize(d);
          if (n) directorSet.add(n);
        });
      }
    });

    // Manual exclude for known directors/composers that TMDB might miss
    const knownMusicDirectors = ['Ilaiyaraaja', 'Nivas K Prasanna'];
    const knownMovieDirectors = ['Mari Selvaraj', 'Raju Murugan'];
    const knownDirectors = new Set([...knownMusicDirectors, ...knownMovieDirectors].map(n => normalize(n)));

    // Aggregate likes for singers and directors
    const singerMap = new Map<string, { name: string; likes: number }>();
    const musicDirectorMap = new Map<string, { name: string; likes: number }>();
    const movieDirectorMap = new Map<string, { name: string; likes: number }>();

    data.forEach((row: any) => {
      const likes = Number(row.likes || 0);

      // Singers (exclude directors)
      if (row.singers) {
        splitArtists(row.singers).forEach((s: string) => {
          if (!s) return;
          const n = normalize(s);
          if (!n) return;
          if (directorSet.has(n)) return; // strictly exclude any director
          if (knownDirectors.has(n)) return; // manual exclude for known directors
          const existing = singerMap.get(n);
          if (existing) existing.likes += likes;
          else singerMap.set(n, { name: s.trim(), likes });
        });
      }

      // Music Directors
      if (row.music_director) {
        splitArtists(row.music_director).forEach((d: string) => {
          if (!d) return;
          const n = normalize(d);
          if (!n) return;
          const existing = musicDirectorMap.get(n);
          if (existing) existing.likes += likes;
          else musicDirectorMap.set(n, { name: d.trim(), likes });
        });
      }

      // Movie Directors
      if (row.movie_director) {
        splitArtists(row.movie_director).forEach((d: string) => {
          if (!d) return;
          const n = normalize(d);
          if (!n) return;
          const existing = movieDirectorMap.get(n);
          if (existing) existing.likes += likes;
          else movieDirectorMap.set(n, { name: d.trim(), likes });
        });
      }
    });

    // Clean Name Helper
    const cleanName = (n: string) =>
      n
        .replace(/\(.*?\)/g, '')
        .replace(/\b(music|director|composer|singer|vocals|vocal|feat|ft)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

    // Helper to fetch Person details (Parallelized)
    const enrichArtist = async (rawName: string, likes: number) => {
      const searchQuery = cleanName(rawName);
      const person = await searchPerson(searchQuery);
      return {
        name: person?.name || searchQuery,
        likes,
        image: person?.profile_path ? getImageUrl(person.profile_path, 'w500') : null
      };
    };

    // 1. Process Top Singers (Parallel)
    const sortedSingers = Array.from(singerMap.entries())
      .map(([_, v]) => [v.name, v.likes] as [string, number])
      .sort((a, b) => b[1] - a[1]);

    const topSingerCandidates = sortedSingers.slice(0, 15); // Process top 15 candidates to account for potential skips

    // Filter candidates before fetch to save requests
    const validSingerCandidates = topSingerCandidates.filter(([rawName, _]) => {
      const norm = normalize(rawName);
      if (!norm) return false;
      if (directorSet.has(norm) || musicDirectorMap.has(norm) || movieDirectorMap.has(norm)) return false;
      return true;
    });

    // Fetch images in parallel
    const topSingers = await Promise.all(
      validSingerCandidates.slice(0, 10).map(([name, likes]) => enrichArtist(name, likes))
    );


    // 2. Process Music Directors (Parallel)
    const mdCandidates = Array.from(musicDirectorMap.entries())
      .map(([_, v]) => [v.name, v.likes] as [string, number])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Add known manual MDs if missing
    for (const name of knownMusicDirectors) {
      const norm = normalize(name);
      if (!mdCandidates.some(([cName]) => normalize(cName) === norm)) {
        const likes = musicDirectorMap.get(norm)?.likes || 0;
        mdCandidates.push([name, likes]);
      }
    }

    // Dedup and sort
    const finalMDCandidates = mdCandidates
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const topMusicDirectors = await Promise.all(
      finalMDCandidates.map(([name, likes]) => enrichArtist(name, likes))
    );


    // 3. Process Movie Directors (Parallel)
    const dirCandidates = Array.from(movieDirectorMap.entries())
      .map(([_, v]) => [v.name, v.likes] as [string, number])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Add known manual Directors if missing
    for (const name of knownMovieDirectors) {
      const norm = normalize(name);
      if (!dirCandidates.some(([cName]) => normalize(cName) === norm)) {
        const likes = movieDirectorMap.get(norm)?.likes || 0;
        dirCandidates.push([name, likes]);
      }
    }

    const finalDirCandidates = dirCandidates
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const topMovieDirectors = await Promise.all(
      finalDirCandidates.map(([name, likes]) => enrichArtist(name, likes))
    );

    return { topSingers, topMusicDirectors, topMovieDirectors };
  },
  ['top-artists-home-v6'], // Bump version
  { revalidate: 3600, tags: ['homepage-artists'] }
);

// Direct RPC calls for debugging and ensuring freshness
async function getTopMoviesHero() {
  const { data, error } = await supabase.rpc('get_top_movies_by_likes', { limit_count: 10 });
  if (error) {
    console.error('Error fetching top movies:', JSON.stringify(error, null, 2));
    return [];
  }
  return data || [];
}

async function getTopContributorsList() {
  const { data, error } = await supabase.rpc('get_top_contributors', { limit_count: 10 });
  if (error) {
    console.error('Error fetching top contributors:', JSON.stringify(error, null, 2));
    return [];
  }
  return data || [];
}

export default async function Home() {
  console.log('--- Homepage Render Start ---');
  // Parallel Fetching
  const [
    topMoviesRaw,
    trendingRes,
    recentRes,
    nostalgiaRes,
    topArtistsData,
    topContributorsRaw
  ] = await Promise.all([
    getTopMoviesHero(),
    supabase.from('ringtones').select('*').eq('status', 'approved').order('created_at', { ascending: false }).limit(5),
    supabase.from('ringtones').select('*').eq('status', 'approved').order('created_at', { ascending: false }).limit(5),
    supabase.from('ringtones').select('*').eq('status', 'approved').lt('movie_year', '2015').order('likes', { ascending: false }).limit(10),
    getTopArtists(),
    getTopContributorsList()
  ]);

  // 1. Process Top Movies
  const heroRingtones = topMoviesRaw.map((m: any) => ({
    id: m.ringtone_id,
    title: m.ringtone_title,
    slug: m.ringtone_slug,
    movie_name: m.movie_name,
    movie_year: m.ringtone_movie_year,
    poster_url: m.ringtone_poster_url,
    likes: m.total_likes,
    downloads: 0,
    created_at: new Date().toISOString(),
    audio_url: '',
    waveform_url: '',
    backdrop_url: '',
    singers: ''
  } as Ringtone));

  // 2. Process Trending
  const trending = trendingRes.data;

  // 3. Process Recent
  const recent = recentRes.data;

  // 4. Process Nostalgia
  const nostalgia = nostalgiaRes.data;

  // 5. Process Top Artists
  const { topSingers, topMusicDirectors, topMovieDirectors } = topArtistsData as {
    topSingers: { name: string; likes: number; image: string | null }[];
    topMusicDirectors: { name: string; likes: number; image: string | null }[];
    topMovieDirectors: { name: string; likes: number; image: string | null }[];
  };

  // 6. Process Top Contributors
  const topContributors: { id: string; name: string; image: string | null; count: number; points: number; title: string; level: number }[] = topContributorsRaw.map((c: any) => ({
    id: c.user_id,
    name: c.full_name || 'Ringtone User',
    image: c.avatar_url,
    count: c.upload_count,
    points: c.points,
    title: getLevelTitle(c.level),
    level: c.level
  }));

  // JSON-LD for WebSite
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TamilRing',
    url: 'https://tamilring.in',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://tamilring.in/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <div className="w-full md:max-w-6xl mx-auto pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Visual Hidden H1 for SEO */}
      <h1 className="sr-only">
        TamilRing - Download Best Tamil Ringtones & BGM (தமிழ் ரிங்டோன்)
      </h1>

      {/* Hero Section - Top 10 Movies by Total Likes */}
      <HeroSlider ringtones={heroRingtones || []} />



      {/* Top Singers (The Voices You Love) */}
      {topSingers.length > 0 && (
        <div className="mb-10">
          <div className="px-4">
            <SectionHeader title="The Voices You Love" />
          </div>
          <div className="flex overflow-x-auto px-4 pb-8 scrollbar-hide snap-x pt-2 pl-6">
            {topSingers.map((singer, idx) => (
              <HeroCard
                key={idx}
                index={idx}
                name={singer.name}
                image={singer.image || ''}
                href={`/artist/${encodeURIComponent(singer.name)}`}
                subtitle={`${singer.likes} Likes`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Nostalgia (Rewind: Memories) */}
      {nostalgia && nostalgia.length > 0 && (
        <div className="mb-10">
          <div className="px-4">
            <SectionHeader title="Rewind: Memories" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 -mt-2">Rings that bring back the good times</p>
          </div>
          <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x">
            {nostalgia.map(ringtone => (
              <Link key={ringtone.id} href={`/ringtone/${ringtone.slug}`} className="snap-start shrink-0 w-32 group">
                <div className="relative w-32 h-40 rounded-xl overflow-hidden mb-2 bg-zinc-200 dark:bg-neutral-800 shadow-lg group-hover:shadow-emerald-500/10 transition-all">
                  {ringtone.poster_url ? (
                    <Image src={ringtone.poster_url} alt={ringtone.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600 text-xs">No Img</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                  <div className="absolute bottom-2 right-2 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white font-medium backdrop-blur-sm">
                    {ringtone.movie_year}
                  </div>
                </div>
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">{ringtone.title}</p>
                <p className="text-[10px] text-zinc-500 truncate">{ringtone.movie_name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Browse by Mood (Filter Chips) */}
      <div className="mb-8">
        <div className="px-4 mb-3 flex justify-between items-end">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Browse by Mood</h2>
          <Link href="/categories" className="text-xs text-emerald-500 font-medium hover:text-emerald-400">View All</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide snap-x">
          {MOODS.map((mood, idx) => (
            <Link
              key={idx}
              href={`/mood/${mood}`}
              className="snap-start shrink-0 px-5 py-2 rounded-full border border-zinc-200 dark:border-neutral-700 bg-zinc-100 dark:bg-neutral-900/80 text-zinc-600 dark:text-zinc-300 text-sm font-medium hover:bg-emerald-500 hover:text-white dark:hover:text-neutral-900 hover:border-emerald-500 transition-all shadow-sm whitespace-nowrap"
            >
              {mood}
            </Link>
          ))}
        </div>
      </div>

      {/* Just Added (Responsive Grid) */}
      <div className="px-4 mb-10">
        <SectionHeader title="Just Added" />
        <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 mb-6">
          {recent?.map(ringtone => (
            <RingtoneCard key={ringtone.id} ringtone={ringtone} />
          ))}
        </div>

        <Link
          href="/recent"
          className="block w-full py-3 rounded-xl bg-zinc-100 dark:bg-neutral-800 text-zinc-600 dark:text-zinc-300 text-center text-sm font-bold hover:bg-zinc-200 dark:hover:bg-neutral-700 transition-colors border border-zinc-200 dark:border-neutral-700"
        >
          View All New Ringtones
        </Link>
      </div>

      {/* Top Contributors - Users who uploaded the most rings */}
      {topContributors && topContributors.length > 0 && (
        <div className="mb-10 px-4">
          <SectionHeader title="Top Contributors" />
          <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x pt-2">
            {topContributors.map((c, idx) => (
              <Link key={c.id} href={`/user/${encodeURIComponent(c.id)}`} className="snap-start shrink-0 flex flex-col items-center gap-3 w-24 group">
                <AvatarRank
                  image={c.image}
                  point={c.points}
                  level={c.level || 1}
                  size="md"
                />
                <div className="text-center w-full mt-3 flex flex-col items-center">
                  <span className="text-[10px] text-emerald-400 font-bold tracking-wider mb-0.5">{c.points} Rep</span>
                  <p className="text-xs font-bold text-zinc-200 truncate w-full">{c.name}</p>
                  <span className="text-[10px] text-amber-500 font-bold mt-1">{c.title}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Music Directors (Real Data) - Moved Down */}
      {topMusicDirectors.length > 0 && (
        <div className="mb-10">
          <div className="px-4">
            <SectionHeader title="Music Directors" />
          </div>
          <div className="flex overflow-x-auto px-4 pb-8 scrollbar-hide snap-x pt-2 pl-6">
            {topMusicDirectors.map((md, idx) => (
              <HeroCard
                key={idx}
                index={idx}
                name={md.name}
                image={md.image || ''}
                href={`/artist/${encodeURIComponent(md.name)}`}
                subtitle={`${md.likes} Likes`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Movie Directors */}
      {topMovieDirectors.length > 0 && (
        <div className="mb-10">
          <div className="px-4">
            <SectionHeader title="Movie Directors" />
          </div>
          <div className="flex overflow-x-auto px-4 pb-8 scrollbar-hide snap-x pt-2 pl-6">
            {topMovieDirectors.map((md, idx) => (
              <HeroCard
                key={idx}
                index={idx}
                name={md.name}
                image={md.image || ''}
                href={`/artist/${encodeURIComponent(md.name)}`}
                subtitle={`${md.likes} Likes`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Trending Section (Horizontal) - Moved Down */}
      <div className="mb-10">
        <div className="px-4">
          <SectionHeader title="Trending Ringtones" />
        </div>
        <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x">
          {trending?.map(ringtone => (
            <Link key={ringtone.id} href={`/ringtone/${ringtone.slug}`} className="snap-start shrink-0 w-32 group">
              <div className="relative w-32 h-40 rounded-xl overflow-hidden mb-2 bg-zinc-200 dark:bg-neutral-800 shadow-lg group-hover:shadow-emerald-500/10 transition-all">
                {ringtone.poster_url ? (
                  <Image src={ringtone.poster_url} alt={ringtone.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600 text-xs">No Img</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
              </div>
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">{ringtone.title}</p>
              <p className="text-[10px] text-zinc-500 truncate">{ringtone.movie_name}</p>
            </Link>
          ))}
        </div>
      </div>


    </div>
  );
}
