'use client';

import { useState, useEffect, Suspense } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import RingtoneCard from '@/components/RingtoneCard';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { splitArtists } from '@/lib/utils';
import { MOODS, TOP_SINGERS, POPULAR_ACTORS, MUSIC_DIRECTORS } from '@/lib/constants';
import ImageWithFallback from '@/components/ImageWithFallback';

function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ringtones' | 'movies' | 'artists'>('ringtones');

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 1) {
        setLoading(true);

        let data: any[] = [];

        if (activeTab === 'ringtones') {
          const { data: res } = await supabase
            .from('ringtones')
            .select('*')
            .ilike('title', `%${query}%`)
            .limit(20);
          data = res || [];
        } else if (activeTab === 'movies') {
          // Group by movie name (distinct)
          // Note: Supabase distinct on client side is tricky, better to use RPC or just filter client side for now
          const { data: res } = await supabase
            .from('ringtones')
            .select('movie_name, movie_year, poster_url')
            .ilike('movie_name', `%${query}%`)
            .limit(50);

          // Deduplicate movies
          const uniqueMovies = new Map();
          res?.forEach(item => {
            if (!uniqueMovies.has(item.movie_name)) {
              uniqueMovies.set(item.movie_name, item);
            }
          });
          data = Array.from(uniqueMovies.values());

        } else if (activeTab === 'artists') {
          const { data: res } = await supabase
            .from('ringtones')
            .select('singers')
            .ilike('singers', `%${query}%`)
            .limit(50);

          // Extract and deduplicate singers using splitArtists utility
          const allSingers = new Set<string>();
          res?.forEach(r => {
            splitArtists(r.singers || '').forEach((s: string) => allSingers.add(s));
          });
          // Filter by query again since we split
          data = Array.from(allSingers).filter(s => s.toLowerCase().includes(query.toLowerCase())).map(s => ({ name: s }));
        }

        setResults(data);
        setLoading(false);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, activeTab]);

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-24">
      {/* Search Input */}
      <div className="relative mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs, movies, artists..."
          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-12 py-4 text-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
          autoFocus
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-spin" />}
      </div>

      {query.length > 1 ? (
        <>
          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {['ringtones', 'movies', 'artists'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors ${activeTab === tab
                    ? 'bg-emerald-500 text-neutral-900'
                    : 'bg-neutral-800 text-zinc-400 border border-neutral-700'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="space-y-4">
            {results.length > 0 ? (
              <>
                {activeTab === 'ringtones' && results.map((item) => (
                  <RingtoneCard key={item.id} ringtone={item} />
                ))}

                {activeTab === 'movies' && results.map((item, idx) => (
                  <Link href={`/movie/${encodeURIComponent(item.movie_name)}`} key={idx} className="flex items-center gap-4 p-3 bg-neutral-800/50 rounded-xl border border-neutral-800 hover:border-emerald-500/50 transition-colors">
                    <div className="relative w-12 h-16 bg-neutral-700 rounded overflow-hidden shrink-0">
                      {item.poster_url && <Image src={item.poster_url} alt={item.movie_name} fill className="object-cover" />}
                    </div>
                    <div>
                      <p className="font-bold text-white">{item.movie_name}</p>
                      <p className="text-xs text-zinc-500">{item.movie_year}</p>
                    </div>
                  </Link>
                ))}

                {activeTab === 'artists' && results.map((item, idx) => (
                  <Link href={`/artist/${encodeURIComponent(item.name)}`} key={idx} className="flex items-center gap-4 p-4 bg-neutral-800/50 rounded-xl border border-neutral-800 hover:border-emerald-500/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold">
                      {item.name.charAt(0)}
                    </div>
                    <p className="font-medium text-white">{item.name}</p>
                  </Link>
                ))}
              </>
            ) : (
              !loading && (
                <div className="text-center py-10 text-zinc-500">
                  No results found for "{query}"
                </div>
              )
            )}
          </div>
        </>
      ) : (
        /* Browse / Discovery Section */
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Moods */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">Browse by Mood</h2>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((mood) => (
                <Link
                  key={mood}
                  href={`/mood/${mood.toLowerCase()}`}
                  className="px-4 py-2 bg-neutral-800 border border-white/5 rounded-full text-sm text-zinc-300 hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all"
                >
                  {mood}
                </Link>
              ))}
            </div>
          </section>

          {/* Top Singers */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">Top Singers</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
              {TOP_SINGERS.map((singer) => (
                <Link key={singer.name} href={`/artist/${encodeURIComponent(singer.name)}`} className="flex flex-col items-center gap-2 shrink-0 w-20">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-neutral-800 shadow-lg">
                    <ImageWithFallback src={singer.img} alt={singer.name} className="object-cover" fallbackClassName="bg-neutral-800" />
                  </div>
                  <span className="text-xs text-center text-zinc-300 font-medium truncate w-full">{singer.name}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Popular Actors */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">Popular Actors</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
              {POPULAR_ACTORS.map((actor) => (
                <Link key={actor.name} href={`/actor/${encodeURIComponent(actor.name)}`} className="flex flex-col items-center gap-2 shrink-0 w-20">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-neutral-800 shadow-lg">
                    <ImageWithFallback src={actor.img} alt={actor.name} className="object-cover" fallbackClassName="bg-neutral-800" />
                  </div>
                  <span className="text-xs text-center text-zinc-300 font-medium truncate w-full">{actor.name}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Music Directors */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">Music Directors</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
              {MUSIC_DIRECTORS.map((md) => (
                <Link key={md.name} href={`/artist/${encodeURIComponent(md.name)}`} className="flex flex-col items-center gap-2 shrink-0 w-20">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-neutral-800 shadow-lg">
                    <ImageWithFallback src={md.img} alt={md.name} className="object-cover" fallbackClassName="bg-neutral-800" />
                  </div>
                  <span className="text-xs text-center text-zinc-300 font-medium truncate w-full">{md.name}</span>
                </Link>
              ))}
            </div>
          </section>

        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-zinc-500">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
