import { supabase } from '@/lib/supabaseClient';
import RingtoneCard from '@/components/RingtoneCard';
import SectionHeader from '@/components/SectionHeader';
import HeroCard from '@/components/HeroCard';
import HeroSlider from '@/components/HeroSlider';
import ImageWithFallback from '@/components/ImageWithFallback';
import Link from 'next/link';
import Image from 'next/image';
import { Mic, Clapperboard, User } from 'lucide-react';
import { TOP_SINGERS, POPULAR_ACTORS, MUSIC_DIRECTORS, MOODS } from '@/lib/constants';
import { Ringtone } from '@/types';

export const revalidate = 0; // Disable caching for real-time updates

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

  // Find the movie with the most likes
  let mostLikedMovie = { name: '', likes: 0, ringtones: [] as Ringtone[] };
  movieLikes.forEach((data, movieName) => {
    if (data.likes > mostLikedMovie.likes) {
      mostLikedMovie = { name: movieName, likes: data.likes, ringtones: data.ringtones };
    }
  });

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

  return (
    <div className="max-w-md mx-auto pb-20">

      {/* Hero Section - Most Liked Movie of the Week */}
      <HeroSlider ringtones={heroRingtones || []} movieName={mostLikedMovie.name} totalLikes={mostLikedMovie.likes} />

      {/* Browse by Mood (Filter Chips) */}
      <div className="mb-8">
        <div className="px-4 mb-3">
          <h2 className="text-lg font-bold text-zinc-100">Browse by Mood</h2>
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

      {/* Top Singers (Limelight) */}
      <div className="mb-10">
        <div className="px-4">
          <SectionHeader title="Top Singers" />
        </div>
        <div className="flex overflow-x-auto px-4 pb-8 scrollbar-hide snap-x pt-2 pl-6">
          {TOP_SINGERS.map((singer, idx) => (
            <HeroCard
              key={idx}
              index={idx}
              name={singer.name}
              image={singer.img}
              href={`/artist/${encodeURIComponent(singer.name)}`}
              subtitle={`${((singer.name.length * 0.3) + 0.5).toFixed(1)}M Fans`}
            />
          ))}
        </div>
      </div>

      {/* Music Directors */}
      <div className="mb-10">
        <div className="px-4">
          <SectionHeader title="Music Directors" />
        </div>
        <div className="flex overflow-x-auto px-4 pb-8 scrollbar-hide snap-x pt-2 pl-6">
          {MUSIC_DIRECTORS.map((md, idx) => (
            <HeroCard
              key={idx}
              index={idx}
              name={md.name}
              image={md.img}
              href={`/artist/${encodeURIComponent(md.name)}`}
              subtitle={`${((md.name.length * 0.2) + 0.8).toFixed(1)}M Fans`}
            />
          ))}
        </div>
      </div>

      {/* Popular Actors */}
      <div className="mb-10">
        <div className="px-4">
          <SectionHeader title="Popular Actors" />
        </div>
        <div className="flex overflow-x-auto px-4 pb-8 scrollbar-hide snap-x pt-2 pl-6">
          {POPULAR_ACTORS.map((actor, idx) => (
            <HeroCard
              key={idx}
              index={idx}
              name={actor.name}
              image={actor.img}
              href={`/actor/${encodeURIComponent(actor.name)}`}
              subtitle={`${((actor.name.length * 0.4) + 2).toFixed(1)}M Fans`}
            />
          ))}
        </div>
      </div>

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
