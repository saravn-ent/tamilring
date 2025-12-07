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
const getTopArtists = unstable_cache(
  async () => {
    const { data } = await supabase
      .from('ringtones')
      .select('singers, music_director, movie_director, likes');

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

    // Build top singers but skip results that are actually directors according to TMDB
    const sortedSingers = Array.from(singerMap.entries())
      .map(([_, v]) => [v.name, v.likes] as [string, number])
      .sort((a, b) => b[1] - a[1]);
    // Debug info for why some singer candidates were skipped
    const debugSkipped: { name: string; likes: number; reason: string; norm: string; tmdbDept?: string | null }[] = [];

    const topSingers: { name: string; likes: number; image: string | null }[] = [];
    for (const [name, likes] of sortedSingers) {
      if (topSingers.length >= 10) break;
      const norm = normalize(name);
      if (!norm) continue;
      // Exclude if this normalized singer name appears in known director sets/maps
      if (directorSet.has(norm) || musicDirectorMap.has(norm) || movieDirectorMap.has(norm)) {
        debugSkipped.push({ name, likes, reason: 'normalized-matches-director', norm });
        continue;
      }
      const person = await searchPerson(name);
      // If TMDB says this person is primarily in Directing or Music (i.e., directors/composers), skip them from singer list
      if (person?.known_for_department) {
        const dept = person.known_for_department.toLowerCase();
        if (dept === 'directing' || dept === 'music') {
          debugSkipped.push({ name, likes, reason: 'tmdb-dept', norm, tmdbDept: dept });
          continue;
        }
      }
      topSingers.push({
        name,
        likes,
        image: person?.profile_path ? getImageUrl(person.profile_path, 'w500') : null
      });
    }

    const topMusicDirectors = await Promise.all(
      Array.from(musicDirectorMap.entries())
        .map(([_, v]) => [v.name, v.likes] as [string, number])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(async ([name, likes]) => {
          const person = await searchPerson(name);
          return {
            name,
            likes,
            image: person?.profile_path ? getImageUrl(person.profile_path, 'w500') : null
          };
        })
    );

    // Include known music directors if not already present
    for (const name of knownMusicDirectors) {
      const norm = normalize(name);
      if (!topMusicDirectors.some(d => normalize(d.name) === norm)) {
        const likes = musicDirectorMap.get(norm)?.likes || 0;
        const person = await searchPerson(name);
        topMusicDirectors.push({
          name,
          likes,
          image: person?.profile_path ? getImageUrl(person.profile_path, 'w500') : null
        });
      }
    }

    // Sort by likes descending
    topMusicDirectors.sort((a, b) => b.likes - a.likes);

    const topMovieDirectors = await Promise.all(
      Array.from(movieDirectorMap.entries())
        .map(([_, v]) => [v.name, v.likes] as [string, number])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(async ([name, likes]) => {
          const person = await searchPerson(name);
          return {
            name,
            likes,
            image: person?.profile_path ? getImageUrl(person.profile_path, 'w500') : null
          };
        })
    );

    // Include known directors if not already present
    for (const name of knownMovieDirectors) {
      const norm = normalize(name);
      if (!topMovieDirectors.some(d => normalize(d.name) === norm)) {
        const likes = movieDirectorMap.get(norm)?.likes || 0;
        const person = await searchPerson(name);
        topMovieDirectors.push({
          name,
          likes,
          image: person?.profile_path ? getImageUrl(person.profile_path, 'w500') : null
        });
      }
    }

    // Sort by likes descending
    topMovieDirectors.sort((a, b) => b.likes - a.likes);

    return { topSingers, topMusicDirectors, topMovieDirectors, debugSkipped } as any;
  },
  ['top-artists-home-v4'],
  { revalidate: 3600 }
);

export default async function Home() {
  // 1. Fetch all approved ringtones to calculate top movies by total likes
  const { data: allRingtones } = await supabase
    .from('ringtones')
    .select('*')
    .eq('status', 'approved');

  // Calculate movies with highest aggregate likes
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

  // Get top 10 movies by total likes
  const topMovies = Array.from(movieLikes.entries())
    .map(([name, data]) => ({
      name,
      likes: data.likes,
      ringtones: data.ringtones
    }))
    .sort((a, b) => {
      if (b.likes !== a.likes) return b.likes - a.likes;
      return b.ringtones.length - a.ringtones.length;
    })
    .slice(0, 10);

  // For each top movie, get its most liked ringtone for the hero slider
  const heroRingtones = topMovies.map(movie => {
    // Sort ringtones by likes and take the top one
    const topRingtone = movie.ringtones
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))[0];
    return topRingtone;
  }).filter(Boolean);

  // 2. Fetch Trending (Top 5 by downloads - mocked for now as downloads col might be empty, using created_at)
  const { data: trending } = await supabase
    .from('ringtones')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false }) // TODO: Change to downloads when available
    .limit(5);

  // 3. Fetch Recent (Limit to 5)
  const { data: recent } = await supabase
    .from('ringtones')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(5);

  // 4. Fetch Nostalgia (Movies before 2015) - Random sample or sorted by likes
  const { data: nostalgia } = await supabase
    .from('ringtones')
    .select('*')
    .eq('status', 'approved')
    .lt('movie_year', '2015')
    .order('likes', { ascending: false })
    .limit(10);

  // 4. Fetch Top Artists (Cached)
  const { topSingers, topMusicDirectors, topMovieDirectors, debugSkipped } =
    (await getTopArtists()) as {
      topSingers: { name: string; likes: number; image: string | null }[];
      topMusicDirectors: { name: string; likes: number; image: string | null }[];
      topMovieDirectors: { name: string; likes: number; image: string | null }[];
      debugSkipped: { name: string; likes: number; reason: string; norm: string; tmdbDept?: string | null }[];
    };

  // 5. Compute Top Contributors (by uploads)
  const { data: uploads } = await supabase
    .from('ringtones')
    .select('user_id')
    .eq('status', 'approved')
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

  let topContributors: { id: string; name?: string; image?: string | null; count: number }[] = [];
  if (topContributorsIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', topContributorsIds as string[]);

    const profileMap = new Map<string, { name: string; image: string | null }>();
    profiles?.forEach((p: any) => profileMap.set(p.id, {
      name: p.full_name || 'Anonymous User',
      image: p.avatar_url
    }));

    topContributors = Array.from(contribCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([user_id, count]) => {
        const profile = profileMap.get(user_id);
        return {
          id: user_id,
          name: profile?.name || 'Anonymous User',
          image: profile?.image || null,
          count
        };
      });
  }

  return (
    <div className="max-w-md mx-auto pb-20">

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
          <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x pt-2">
            {topContributors.map((c, idx) => (
              <Link key={c.id} href={`/user/${encodeURIComponent(c.id)}`} className="snap-start shrink-0 flex flex-col items-center gap-3 w-24 group">
                <div className="w-20 h-20 rounded-full bg-neutral-800 border-2 border-neutral-700 overflow-hidden relative group-hover:border-emerald-500 transition-colors shadow-lg">
                  {c.image ? (
                    <Image src={c.image} alt={c.name || 'User'} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500">
                      <User size={32} />
                    </div>
                  )}
                </div>
                <div className="text-center w-full">
                  <p className="text-xs font-bold text-zinc-200 truncate w-full">{c.name}</p>
                  <p className="text-[10px] text-zinc-500">{c.count} uploads</p>
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
