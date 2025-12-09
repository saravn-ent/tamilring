import DiscoverySearch from '@/components/DiscoverySearch';
import Link from 'next/link';
import { Heart, Zap, Frown, Music, Mic2, Disc, Guitar, Wind, Moon, Dumbbell, Plane, Sparkles, Flame, Smile, Clock, Clapperboard, User } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { unstable_cache } from 'next/cache';
import ImageWithFallback from '@/components/ImageWithFallback';
import { ERAS } from '@/lib/constants';

const getFeaturedArtists = unstable_cache(
  async () => {
    const { data } = await supabase
      .from('ringtones')
      .select('singers, music_director, poster_url')
      .eq('status', 'approved')
      .limit(100);

    if (!data) return [];

    const artistsMap = new Map<string, { type: string, image: string }>();

    data.forEach(row => {
      // Music Directors
      if (row.music_director) {
        const md = row.music_director.trim();
        if (md && !artistsMap.has(md)) {
          artistsMap.set(md, { type: 'Director', image: row.poster_url || '' });
        }
      }
      // Singers
      if (row.singers) {
        row.singers.split(/,|&/).map((s: string) => s.trim()).forEach((s: string) => {
          if (s && !artistsMap.has(s)) {
            artistsMap.set(s, { type: 'Singer', image: row.poster_url || '' });
          }
        });
      }
    });

    // Convert to array and shuffle
    const allArtists = Array.from(artistsMap.entries()).map(([name, info]) => ({
      name,
      ...info
    }));

    // Simple shuffle
    for (let i = allArtists.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allArtists[i], allArtists[j]] = [allArtists[j], allArtists[i]];
    }

    return allArtists.slice(0, 9); // Return top 9 random
  },
  ['featured-artists-discovery'],
  { revalidate: 60 }
);

export default async function DiscoveryHub() {
  const featuredArtists = await getFeaturedArtists();

  const MOODS = [
    { name: "Love", icon: Heart, color: "text-rose-400" },
    { name: "Mass", icon: Zap, color: "text-amber-400" },
    { name: "Sad", icon: Frown, color: "text-blue-400" },
    { name: "BGM", icon: Music, color: "text-emerald-400" },
    { name: "Funny", icon: Smile, color: "text-orange-400" },
    { name: "Melody", icon: Mic2, color: "text-purple-400" },
  ];

  /* ERAS imported from constants */

  const INSTRUMENTS = [
    { label: "Flute", icon: Wind, query: "flute" },
    { label: "Violin", icon: Music, query: "violin" },
    { label: "Guitar", icon: Guitar, query: "guitar" },
    { label: "Piano", icon: Disc, query: "piano" }
  ];

  return (
    <div className="max-w-md mx-auto p-4 pb-24 min-h-screen">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">Discover</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">Find your perfect ringtone</p>
      </div>

      {/* Search Bar */}
      <DiscoverySearch />

      {/* By Mood */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-emerald-500" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">By Mood</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
          {MOODS.map((mood) => (
            <Link
              key={mood.name}
              href={`/mood/${mood.name}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-100 dark:bg-neutral-800/50 border border-zinc-200 dark:border-white/5 hover:bg-zinc-200 dark:hover:bg-neutral-700 hover:border-emerald-500/30 transition-all shrink-0 group"
            >
              <mood.icon size={16} className={`${mood.color} group-hover:scale-110 transition-transform`} />
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white">{mood.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* By Era */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-emerald-500" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">By Era</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ERAS.map((era) => (
            <Link
              key={era.label}
              href={`/search?q=${era.label}`}
              className={`relative h-24 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br ${era.color} border border-zinc-200 dark:border-white/5 hover:scale-[1.02] transition-transform group shadow-md`}
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              <span className="relative text-xl font-black italic text-white tracking-wider drop-shadow-lg opacity-90">{era.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Instruments */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Music size={16} className="text-emerald-500" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Instruments</h2>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {INSTRUMENTS.map((inst) => (
            <Link
              key={inst.label}
              href={`/search?q=${inst.query}`}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-800/30 border border-zinc-200 dark:border-white/5 hover:bg-zinc-100 dark:hover:bg-neutral-800 hover:border-emerald-500/30 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-neutral-700/50 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                <inst.icon size={18} />
              </div>
              <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{inst.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Artists (Bubbles) */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Flame size={16} className="text-emerald-500" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Featured Artists</h2>
        </div>
        <div className="flex flex-wrap justify-center gap-6 py-4">
          {featuredArtists.map((artist, idx) => {
            // Generate random gradient for each artist bubble
            const gradients = [
              "from-blue-500 to-cyan-400",
              "from-purple-500 to-pink-400",
              "from-rose-500 to-orange-400",
              "from-emerald-500 to-teal-400",
              "from-amber-500 to-yellow-400"
            ];
            const color = gradients[idx % gradients.length];

            return (
              <Link
                key={artist.name}
                href={`/artist/${encodeURIComponent(artist.name)}`}
                className="group relative flex flex-col items-center justify-center w-28 h-28"
              >
                {/* Bubble Effect */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${color} opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500 animate-pulse`} />

                <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${color} p-0.5 shadow-lg shadow-black/10 dark:shadow-black/50 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="w-full h-full rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm flex items-center justify-center border border-zinc-200 dark:border-white/10 overflow-hidden relative">
                    <ImageWithFallback
                      src={artist.image}
                      alt={artist.name}
                      className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      fallbackClassName="bg-zinc-200 dark:bg-neutral-800 text-zinc-500"
                    />
                  </div>

                  {/* Shine */}
                  <div className="absolute top-2 left-4 w-4 h-2 bg-white/40 dark:bg-white/20 rounded-full blur-[1px] rotate-[-45deg] z-10" />
                </div>

                <span className="mt-3 text-xs font-bold text-zinc-700 dark:text-zinc-300 text-center line-clamp-1 w-full px-1 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">{artist.name}</span>
              </Link>
            )
          })}
        </div>
      </section>

    </div>
  );
}
