import { supabase } from '@/lib/supabaseClient';
import RingtoneCard from '@/components/RingtoneCard';
import SectionHeader from '@/components/SectionHeader';
import HeroCard from '@/components/HeroCard';
import HeroSlider from '@/components/HeroSlider';
import ImageWithFallback from '@/components/ImageWithFallback';
import Link from 'next/link';
import Image from 'next/image';
import { Mic, Clapperboard, User } from 'lucide-react';
import { MOODS } from '@/lib/constants';
import { Ringtone } from '@/types';
import { unstable_cache } from 'next/cache';

export const revalidate = 0; // Disable caching for real-time updates

const getTopArtists = unstable_cache(
  async () => {
    const { data } = await supabase
      .from('ringtones')
      .select('singers, music_director');

    if (!data) return { topSingers: [], topMDs: [] };

    const singerCounts = new Map<string, number>();
    const mdCounts = new Map<string, number>();

    data.forEach(row => {
      // Count Singers
      if (row.singers) {
        row.singers.split(/,|&/).map(s => s.trim()).forEach(s => {
          if (s) singerCounts.set(s, (singerCounts.get(s) || 0) + 1);
        });
      }
      // Count Music Directors
      if (row.music_director) {
        const md = row.music_director.trim();
        if (md) mdCounts.set(md, (mdCounts.get(md) || 0) + 1);
      }
    });

    const topSingers = Array.from(singerCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const topMDs = Array.from(mdCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

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

  // 4. Fetch Top Artists (Cached)
  const { topSingers, topMDs } = await getTopArtists();

  return (
    <div className="max-w-md mx-auto pb-20">

      {/* Hero Section - Most Liked Movie of the Week */}
      <HeroSlider ringtones={heroRingtones || []} movieName={mostLikedMovie.name} totalLikes={mostLikedMovie.likes} />

      {/* Browse by Mood (Filter Chips) */}
      <div className="mb-8">
        <div className="px-4 mb-3 flex justify-between items-end">
          <h2 className="text-lg font-bold text-zinc-100">Browse by Mood</h2>
          <Link href="/categories" className="text-xs text-emerald-500 font-medium hover:text-emerald-400">View All</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide snap-x">
          {MOODS.map((mood, idx) => (
            <Link
              key={idx}
              href={`/mood/${mood}`}
              className="snap-start shrink-0 px-5 py-2 rounded-full border border-neutral-700 bg-neutral-900/80 text-zinc-300 text-sm font-medium hover:bg-emerald-500 hover:text-neutral-900 hover:border-emerald-500 transition-all shadow-sm whitespace-nowrap"
            >
              {mood}
            </Link>
          ))}
        </div>
      </div>

      {/* Top Singers (Real Data) */}
      {topSingers.length > 0 && (
        <div className="mb-10">
          <div className="px-4">
            <SectionHeader title="Top Singers" />
          </div>
          <div className="flex overflow-x-auto px-4 pb-8 scrollbar-hide snap-x pt-2 pl-6">
            {topSingers.map((singer, idx) => (
              <HeroCard
                key={idx}
                index={idx}
                name={singer.name}
                image="" // No image in DB yet
                href={`/artist/${encodeURIComponent(singer.name)}`}
                subtitle={`${singer.count} Songs`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Music Directors (Real Data) */}
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
                image="" // No image in DB yet
                href={`/artist/${encodeURIComponent(md.name)}`}
                subtitle={`${md.count} Songs`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Trending Section (Horizontal) */}
      <div className="mb-10">
        <div className="px-4">
          <SectionHeader title="Trending Ringtones" />
        </div>
        <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x">
          {trending?.map(ringtone => (
            <Link key={ringtone.id} href={`/ringtone/${ringtone.slug}`} className="snap-start shrink-0 w-32 group">
              <div className="relative w-32 h-40 rounded-xl overflow-hidden mb-2 bg-neutral-800 shadow-lg group-hover:shadow-emerald-500/10 transition-all">
                {ringtone.poster_url ? (
                  <Image src={ringtone.poster_url} alt={ringtone.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">No Img</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
              </div>
              <p className="text-xs font-bold text-zinc-200 truncate group-hover:text-emerald-400 transition-colors">{ringtone.title}</p>
              <p className="text-[10px] text-zinc-500 truncate">{ringtone.movie_name}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Just Added (Vertical - Fixed 5) */}
      <div className="px-4">
        <SectionHeader title="Just Added" />
        <div className="space-y-3 mb-6">
          {recent?.map(ringtone => (
            <RingtoneCard key={ringtone.id} ringtone={ringtone} />
          ))}
        </div>

        <Link
          href="/recent"
          className="block w-full py-3 rounded-xl bg-neutral-800 text-zinc-300 text-center text-sm font-bold hover:bg-neutral-700 transition-colors border border-neutral-700"
        >
          View All New Ringtones
        </Link>
      </div>

    </div>
  );
}
