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
import { JsonLdScript } from '@/components/JsonLdScript';
import { generateHomeMetadata } from '@/lib/seo';
import { generateOrganizationSchema, generateWebSiteSchema, combineSchemas } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';
import { getTrendingRingtones, getTopAlbums } from '@/app/actions/ringtones';
import EngagementBanner from '@/components/EngagementBanner';

export const revalidate = 3600; // Revalidate every hour

// Generate SEO metadata for homepage
export const metadata = generateHomeMetadata();

const getTopArtists = unstable_cache(
  async () => {
    // 1. Fetch Aggregated Artist Stats from Database RPC
    const { data: allPeople, error } = await supabase.rpc('get_all_people_stats');

    if (error || !allPeople) {
      console.error('Error fetching artist stats:', error);
      return { topSingers: [], topMusicDirectors: [], topMovieDirectors: [] };
    }

    // Helper to fetch Person details (Sequential to avoid Rate Limits)
    const cleanName = (n: string) => n.replace(/\(.*?\)/g, '').trim();
    const enrichArtistsSequential = async (list: any[]) => {
      const results = [];
      for (const stats of list) {
        const searchQuery = cleanName(stats.name);
        const person = await searchPerson(searchQuery);
        results.push({
          name: person?.name || searchQuery,
          likes: Number(stats.total_likes),
          count: Number(stats.total_count),
          image: person?.profile_path ? getImageUrl(person.profile_path, 'w185') : null
        });
        // Small delay to be nice to TMDB
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return results;
    };

    // 2. Filter by Roles & Slice Top 10
    const topMDsList = allPeople.filter((p: any) => p.is_md).slice(0, 10);
    const topDirsList = allPeople.filter((p: any) => p.is_dir).slice(0, 10);

    const excludeNormalized = new Set([
      ...topMDsList.map((p: any) => p.normalized_name),
      ...topDirsList.map((p: any) => p.normalized_name)
    ]);

    const topSingersList = allPeople
      .filter((p: any) => p.is_singer && !excludeNormalized.has(p.normalized_name))
      .slice(0, 12); // A bit more for singers

    // 3. Enrich with TMDB Data Parallelly across chunks but sequential per category
    const [topMusicDirectors, topMovieDirectors, topSingers] = await Promise.all([
      enrichArtistsSequential(topMDsList),
      enrichArtistsSequential(topDirsList),
      enrichArtistsSequential(topSingersList)
    ]);

    return { topSingers, topMusicDirectors, topMovieDirectors };
  },
  ['top-artists-home-v16'], // Bump version
  { revalidate: 3600, tags: ['homepage-artists'] }
);

const getRecentRingtones = unstable_cache(
  async () => {
    const { data } = await supabase.from('ringtones').select('*').eq('status', 'approved').order('created_at', { ascending: false }).limit(5);
    return data || [];
  },
  ['recent-ringtones-v1'],
  { revalidate: 3600, tags: ['recent'] }
);

const getNostalgiaRingtones = unstable_cache(
  async () => {
    const { data } = await supabase.from('ringtones').select('*').eq('status', 'approved').lt('movie_year', '2015').order('likes', { ascending: false }).limit(10);
    return data || [];
  },
  ['nostalgia-ringtones-v1'],
  { revalidate: 3600, tags: ['nostalgia'] }
);

const getTopContributorsList = unstable_cache(
  async () => {
    const { data, error } = await supabase.rpc('get_top_contributors', { limit_count: 10 });
    if (error) {
      console.error('Error fetching top contributors:', JSON.stringify(error, null, 2));
      return [];
    }
    return data || [];
  },
  ['top-contributors-v1'],
  { revalidate: 3600, tags: ['contributors'] }
);

export default async function Home() {
  console.log('--- Homepage Render Start ---');
  // Parallel Fetching
  const [
    topAlbumsRaw,
    trending,
    recent,
    nostalgia,
    topArtistsData,
    topContributorsRaw
  ] = await Promise.all([
    getTopAlbums(10),
    getTrendingRingtones(10),
    getRecentRingtones(),
    getNostalgiaRingtones(),
    getTopArtists(),
    getTopContributorsList()
  ]);

  // 1. Process Top Albums for Hero
  const heroRingtones = topAlbumsRaw.map((m: any) => ({
    id: m.latest_slug,
    title: m.movie_name,
    slug: m.latest_slug,
    movie_name: m.movie_name,
    movie_year: m.max_year,
    poster_url: m.poster_url,
    likes: m.total_engagement,
    downloads: 0,
    created_at: new Date().toISOString(),
    audio_url: '',
    waveform_url: '',
    backdrop_url: '',
    singers: `${m.ringtone_count} ringtones`
  } as Ringtone));


  // 3. Process Recent - (Now directly from cache)

  // 4. Process Nostalgia - (Now directly from cache)

  // 5. Process Top Artists
  const { topSingers, topMusicDirectors, topMovieDirectors } = topArtistsData as {
    topSingers: { name: string; likes: number; count: number; image: string | null }[];
    topMusicDirectors: { name: string; likes: number; count: number; image: string | null }[];
    topMovieDirectors: { name: string; likes: number; count: number; image: string | null }[];
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

  // Generate structured data schemas
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();
  const combinedSchema = combineSchemas(organizationSchema, websiteSchema);

  return (
    <div className="w-full md:max-w-6xl mx-auto pb-20">
      <StructuredData data={combinedSchema} />

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
                subtitle={`${singer.count} rings`}
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
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3 -mt-2">Rings that bring back the good times</p>
          </div>
          <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x">
            {nostalgia.map(ringtone => (
              <Link key={ringtone.id} href={`/ringtone/${ringtone.slug}`} className="snap-start shrink-0 w-32 group">
                <div className="relative w-32 h-40 rounded-xl overflow-hidden mb-2 bg-zinc-200 dark:bg-neutral-800 shadow-lg group-hover:shadow-emerald-500/10 transition-all">
                  {ringtone.poster_url ? (
                    <Image src={ringtone.poster_url} alt={ringtone.title} fill sizes="(max-width: 768px) 33vw, 128px" quality={75} loading="lazy" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 text-xs">No Img</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80" />
                  <div className="absolute bottom-2 right-2 bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-white font-medium backdrop-blur-sm">
                    {ringtone.movie_year}
                  </div>
                </div>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{ringtone.title}</p>
                <p className="text-[10px] text-zinc-600 dark:text-zinc-400 truncate">{ringtone.movie_name}</p>
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
          {recent?.map((ringtone: Ringtone) => (
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
                subtitle={`${md.count} rings`}
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
                subtitle={`${md.count} rings`}
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
          {trending?.map((ringtone: Ringtone) => (
            <Link key={ringtone.id} href={`/ringtone/${ringtone.slug}`} className="snap-start shrink-0 w-32 group">
              <div className="relative w-32 h-40 rounded-xl overflow-hidden mb-2 bg-zinc-200 dark:bg-neutral-800 shadow-lg group-hover:shadow-emerald-500/10 transition-all">
                {ringtone.poster_url ? (
                  <Image src={ringtone.poster_url} alt={ringtone.title} fill sizes="(max-width: 768px) 33vw, 128px" quality={75} loading="lazy" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 text-xs">No Img</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80" />
              </div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{ringtone.title}</p>
              <p className="text-[10px] text-zinc-600 dark:text-zinc-400 truncate">{ringtone.movie_name}</p>
            </Link>
          ))}
        </div>
      </div>

      <EngagementBanner />
    </div>
  );
}
