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

export const revalidate = 0; // Disable caching for real-time updates

const getTopArtists = unstable_cache(
  async () => {
    const { data } = await supabase
      .from('ringtones')
      .select('singers, music_director, movie_director');

    if (!data) return { topSingers: [], topMDs: [] };

    const singerCounts = new Map<string, number>();
    const mdCounts = new Map<string, number>();

    // Build a set of normalized director names (music + movie) to exclude from singer counts
    const directorSet = new Set<string>();
    const normalize = (n: string) =>
      n
        .replace(/\(.*?\)/g, '') // remove parenthetical notes
        .replace(/\./g, '') // remove dots
        .replace(/[^a-z0-9\s]/gi, '') // remove punctuation
        .replace(/\b(music|director|composer|singer)\b/gi, '') // remove role words
        .replace(/\s+/g, ' ') // collapse spaces
        .trim()
        .toLowerCase();

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

    // Use normalized keys for singers to avoid duplicates and to exclude directors reliably
    const singerMap = new Map<string, { name: string; count: number }>();
    data.forEach((row: any) => {
      // Count Singers, excluding any directors
      if (row.singers) {
        splitArtists(row.singers).forEach((s: string) => {
          if (!s) return;
          const n = normalize(s);
          if (!n) return;
          if (directorSet.has(n)) return; // exclude music/movie directors
          if (singerMap.has(n)) {
            singerMap.get(n)!.count += 1;
          } else {
            singerMap.set(n, { name: s.trim(), count: 1 });
          }
        });
      }
      // Count Music Directors (keep original casing)
      if (row.music_director) {
        const md = row.music_director.trim();
        if (md) mdCounts.set(md, (mdCounts.get(md) || 0) + 1);
      }
    });

    const topSingers = await Promise.all(
      Array.from(singerMap.entries())
        .map(([_, v]) => [v.name, v.count] as [string, number])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(async ([name, count]) => {
          const person = await searchPerson(name);
          return {
            name,
            count,
            image: person?.profile_path ? getImageUrl(person.profile_path, 'w500') : null
          };
        })
    );

    const topMDs = await Promise.all(
      Array.from(mdCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(async ([name, count]) => {
          const person = await searchPerson(name);
          return {
            name,
            count,
            image: person?.profile_path ? getImageUrl(person.profile_path, 'w500') : null
          };
        })
    );

    return { topSingers, topMDs };
  },
  ['top-artists-home'],
  { revalidate: 3600 }
);

export default async function Home() {
  // 1. Fetch all ringtones to calculate most liked movie of the week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { data: allRingtones } = await supabase
    .from('ringtones')
    .select('*')
    .gte('created_at', oneWeekAgo.toISOString());

  // Calculate movie with highest aggregate likes
  const movieLikes = new Map<string, { likes: number; ringtones: Ringtone[] }>();

  allRingtones?.forEach(ringtone => {
    const movieName = ringtone.movie_name;
    if (!movieLikes.has(movieName)) {
      movieLikes.set(movieName, { likes: 0, ringtones: [] });
    }
    const movieData = movieLikes.get(movieName)!;
    movieData.likes += ringtone.likes || 0;
    movieData.ringtones.push(ringtone);
  });

  // Find the movie with the most likes (or most ringtones if likes are 0)
  const moviesArray = Array.from(movieLikes.entries()).map(([name, data]) => ({
    name,
    likes: data.likes,
    ringtones: data.ringtones
  }));

  // Sort by likes (desc), then by number of ringtones (desc)
  moviesArray.sort((a, b) => {
    if (b.likes !== a.likes) return b.likes - a.likes;
    return b.ringtones.length - a.ringtones.length;
  });

  const mostLikedMovie = moviesArray[0] || { name: '', likes: 0, ringtones: [] as Ringtone[] };

  // Sort the most liked movie's ringtones by likes (descending) and take top 5
  const heroRingtones = mostLikedMovie.ringtones
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 5);

  // 2. Fetch Trending (Top 5 by downloads - mocked for now as downloads col might be empty, using created_at)
  const { data: trending } = await supabase
    .from('ringtones')
    .select('*')
    .order('created_at', { ascending: false }) // TODO: Change to downloads when available
    .limit(5);


  // 3. Fetch Recent (Limit to 5)
  const { data: recent } = await supabase
    .from('ringtones')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  // 4. Fetch Nostalgia (Movies before 2015) - Random sample or sorted by likes
  const { data: nostalgia } = await supabase
    .from('ringtones')
    .select('*')
    .lt('movie_year', '2015')
    .order('likes', { ascending: false })
    .limit(10);

  // 4. Fetch Top Artists (Cached)
  const { topSingers, topMDs } = await getTopArtists();

  // 5. Compute Top Contributors (by uploads)
  const { data: uploads } = await supabase
    .from('ringtones')
    .select('user_id')
    .not('user_id', 'is', null);

  const contribCounts = new Map<string, number>();
  uploads?.forEach((r: any) => {
    const uid = r.user_id || 'unknown';
    contribCounts.set(uid, (contribCounts.get(uid) || 0) + 1);
  });

  const topContributorsIds = Array.from(contribCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([user_id]) => user_id);

  let topContributors: { id: string; name?: string; count: number }[] = [];
  if (topContributorsIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', topContributorsIds as string[]);

    const profileMap = new Map<string, string>();
    profiles?.forEach((p: any) => profileMap.set(p.id, p.full_name || p.id));

    topContributors = Array.from(contribCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([user_id, count]) => ({ id: user_id, name: profileMap.get(user_id) || user_id, count }));
  }

  return (
    <div className="max-w-md mx-auto pb-20">

      {/* Hero Section - Most Liked Movie of the Week */}
      <HeroSlider ringtones={heroRingtones || []} movieName={mostLikedMovie.name} totalLikes={mostLikedMovie.likes} />



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
                    subtitle={`${singer.count} Rings`}
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

      {/* Just Added (Vertical - Fixed 5) */}
      <div className="px-4 mb-10">
        <SectionHeader title="Just Added" />
        <div className="space-y-3 mb-6">
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
          <div className="grid grid-cols-2 gap-3 mt-3">
            {topContributors.map((c, idx) => (
              <Link key={c.id} href={`/user/${encodeURIComponent(c.id)}`} className="flex items-center justify-between p-3 bg-white/80 dark:bg-neutral-900/40 rounded-xl border border-zinc-200 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-neutral-800 flex items-center justify-center text-sm font-medium text-zinc-700">{(c.name || c.id).slice(0,2).toUpperCase()}</div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{c.name || c.id}</div>
                    <div className="text-xs text-zinc-500">{c.count} rings</div>
                  </div>
                </div>
                <div className="text-xs text-zinc-400">View</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Music Directors (Real Data) - Moved Down */}
      {topMDs.length > 0 && (
        <div className="mb-10">
          <div className="px-4">
            <SectionHeader title="Music Directors" />
          </div>
          <div className="flex overflow-x-auto px-4 pb-8 scrollbar-hide snap-x pt-2 pl-6">
            {topMDs.map((md, idx) => (
              <HeroCard
                key={idx}
                index={idx}
                name={md.name}
                image={md.image || ''}
                href={`/artist/${encodeURIComponent(md.name)}`}
                subtitle={`${md.count} Rings`}
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
