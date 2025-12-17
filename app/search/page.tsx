'use client';

import { useState, useEffect, Suspense } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import RingtoneCard from '@/components/RingtoneCard';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { splitArtists } from '@/lib/utils';
import { MOODS, ERAS } from '@/lib/constants';
import ImageWithFallback from '@/components/ImageWithFallback';
import NoResults from '@/components/NoResults';
import { sanitizeSearchQuery } from '@/lib/sanitize';

function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [loading, setLoading] = useState(false);

  // Results State
  const [results, setResults] = useState<{
    ringtones: any[];
    movies: any[];
    artists: any[];
  }>({ ringtones: [], movies: [], artists: [] });

  const [activeTab, setActiveTab] = useState<'all' | 'ringtones' | 'movies' | 'artists'>('all');

  // Fetch defaults (Trending)
  const [defaults, setDefaults] = useState<{ movies: any[], artists: any[] }>({ movies: [], artists: [] });

  useEffect(() => {
    // Fetch browsing data once on mount
    const fetchDefaults = async () => {
      const { data: movies } = await supabase
        .from('ringtones')
        .select('movie_name, movie_year, poster_url, likes')
        .eq('status', 'approved')
        .order('likes', { ascending: false })
        .limit(20);

      const uniqueMovies = new Map();
      movies?.forEach(m => {
        if (!uniqueMovies.has(m.movie_name)) uniqueMovies.set(m.movie_name, m);
      });

      // Top Artists (Singers + MDs)
      const { data: artists } = await supabase
        .from('ringtones')
        .select('singers, music_director')
        .eq('status', 'approved')
        .limit(50);

      const artistCounts = new Map<string, number>();
      artists?.forEach(r => {
        splitArtists(r.singers || '').forEach((s: string) => artistCounts.set(s, (artistCounts.get(s) || 0) + 1));
        splitArtists(r.music_director || '').forEach((s: string) => artistCounts.set(s, (artistCounts.get(s) || 0) + 1));
      });

      const topArtists = Array.from(artistCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name]) => ({ name }));

      setDefaults({ movies: Array.from(uniqueMovies.values()), artists: topArtists });
    };
    fetchDefaults();
  }, []);

  useEffect(() => {
    // Clear results immediately
    setResults({ ringtones: [], movies: [], artists: [] });
    setLoading(true);

    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 1) {

        let newResults = { ringtones: [], movies: [], artists: [] };

        const matchedEra = ERAS.find(e => e.label.toLowerCase() === query.toLowerCase());

        const fetchRingtones = async () => {
          // SECURITY: Sanitize user input to prevent SQL injection
          const safeQuery = sanitizeSearchQuery(query);

          let dbQuery = supabase
            .from('ringtones')
            .select('*')
            .eq('status', 'approved');

          if (matchedEra) {
            // Era Filtering
            dbQuery = dbQuery
              .gte('movie_year', matchedEra.startYear)
              .lte('movie_year', matchedEra.endYear)
              .order('downloads', { ascending: false }) // Sort by popularity for Eras
              .limit(20);
          } else {
            // Text Search with sanitized input
            dbQuery = dbQuery
              .ilike('title', `%${safeQuery}%`)
              .limit(10);
          }

          const { data } = await dbQuery;
          return data || [];
        };

        const fetchMovies = async () => {
          // SECURITY: Sanitize user input to prevent SQL injection
          const safeQuery = sanitizeSearchQuery(query);

          let dbQuery = supabase
            .from('ringtones')
            .select('movie_name, movie_year, poster_url')
            .eq('status', 'approved');

          if (matchedEra) {
            dbQuery = dbQuery
              .gte('movie_year', matchedEra.startYear)
              .lte('movie_year', matchedEra.endYear)
              .limit(50);
          } else {
            dbQuery = dbQuery
              .ilike('movie_name', `%${safeQuery}%`)
              .limit(20);
          }

          const { data } = await dbQuery;

          const uniqueMovies = new Map();
          data?.forEach(item => {
            if (!uniqueMovies.has(item.movie_name)) uniqueMovies.set(item.movie_name, item);
          });
          return Array.from(uniqueMovies.values());
        };

        const fetchArtists = async () => {
          // Artists don't have years attached directly in a searchable way for Eras, 
          // and "Top Artists from the 80s" is complex without an 'artist_era' column.
          // For now, if searching by Era, we might return empty artists or just generic text search matches?

          if (matchedEra) {
            // Optional: Find artists who have songs in that era? 
            // That requires a JOIN or complex query not easily doable in one go.
            // Let's return empty for Artists tab in Era mode to keep it clean, 
            // OR just run the text search just in case they typed "80s" and there's a band called "80s".
            return [];
          }

          // SECURITY: Sanitize user input to prevent SQL injection
          const safeQuery = sanitizeSearchQuery(query);

          const { data } = await supabase
            .from('ringtones')
            .select('singers, music_director')
            .eq('status', 'approved')
            .or(`singers.ilike.%${safeQuery}%,music_director.ilike.%${safeQuery}%`)
            .limit(20);

          const allArtists = new Set<string>();
          data?.forEach(r => {
            splitArtists(r.singers || '').forEach(s => allArtists.add(s));
            splitArtists(r.music_director || '').forEach(s => allArtists.add(s));
          });
          return Array.from(allArtists)
            .filter(s => s.toLowerCase().includes(safeQuery.toLowerCase()))
            .map(s => ({ name: s }))
            .slice(0, 10);
        };

        if (activeTab === 'all') {
          const [r, m, a] = await Promise.all([fetchRingtones(), fetchMovies(), fetchArtists()]);
          newResults = { ringtones: r, movies: m, artists: a } as any;
        } else if (activeTab === 'ringtones') {
          newResults.ringtones = await fetchRingtones() as any;
        } else if (activeTab === 'movies') {
          newResults.movies = await fetchMovies() as any;
        } else if (activeTab === 'artists') {
          newResults.artists = await fetchArtists() as any;
        }

        setResults(newResults);
        setLoading(false);
      } else {
        setLoading(false); // Ensure loading is false if query is short
      }
    }, 300); // Reduced debounce for snappier feel

    return () => clearTimeout(delayDebounceFn);
  }, [query, activeTab]);

  const hasResults = results.ringtones.length > 0 || results.movies.length > 0 || results.artists.length > 0;
  const matchedEra = ERAS.find(e => e.label.toLowerCase() === query.toLowerCase());

  const tabs = ['all', 'ringtones', 'movies', 'artists'].filter(tab => {
    if (matchedEra && tab === 'artists') return false;
    return true;
  });

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-24">
      {/* Search Input */}
      <div className="relative mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search rings, movies, artists..."
          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-12 py-4 text-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
          autoFocus
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-spin" />}
      </div>

      {/* Tabs (Always Visible) */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
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

      {query.length > 1 ? (
        /* ... SEARCH RESULTS ... */
        <div className="space-y-8">
          {loading ? (
            /* SKELETONS */
            <div className="animate-pulse space-y-8">
              {/* Movie Skeleton */}
              {(activeTab === 'all' || activeTab === 'movies') && (
                <div className="space-y-3">
                  <div className="h-4 w-20 bg-neutral-800 rounded ml-1" />
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2].map(i => (
                      <div key={i} className="aspect-[2/3] bg-neutral-800 rounded-xl border border-neutral-700/50" />
                    ))}
                  </div>
                </div>
              )}
              {/* Ringtone Skeleton */}
              {(activeTab === 'all' || activeTab === 'ringtones') && (
                <div className="space-y-3">
                  <div className="h-4 w-24 bg-neutral-800 rounded ml-1" />
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-neutral-800 rounded-xl border border-neutral-700/50" />
                  ))}
                </div>
              )}
            </div>
          ) : hasResults ? (
            <>
              {/* Movies Section */}
              {(activeTab === 'all' || activeTab === 'movies') && results.movies.length > 0 && (
                <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <h3 className="font-bold text-zinc-400 text-xs uppercase tracking-wider mb-3 px-1">
                    {ERAS.find(e => e.label.toLowerCase() === query.toLowerCase()) ? `${query} Movies` : (activeTab === 'all' ? 'Movies' : 'Matching Movies')}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {results.movies.map((item, idx) => (
                      <Link href={`/movie/${encodeURIComponent(item.movie_name)}`} key={idx} className="flex flex-col gap-2 p-2 bg-neutral-900 rounded-xl border border-neutral-800 hover:border-emerald-500/50 transition-colors group">
                        <div className="relative w-full aspect-[2/3] bg-neutral-800 rounded-lg overflow-hidden shrink-0">
                          {item.poster_url ? <Image src={item.poster_url} alt={item.movie_name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" /> : null}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm truncate">{item.movie_name}</p>
                          <p className="text-[10px] text-zinc-500">{item.movie_year}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Artists Section */}
              {(activeTab === 'all' || activeTab === 'artists') && results.artists.length > 0 && (
                <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
                  <h3 className="font-bold text-zinc-400 text-xs uppercase tracking-wider mb-3 px-1">Artists</h3>
                  <div className="flex flex-wrap gap-3">
                    {results.artists.map((item, idx) => (
                      <Link href={`/artist/${encodeURIComponent(item.name)}`} key={idx} className="flex items-center gap-3 pr-4 pl-2 py-2 bg-neutral-900 rounded-full border border-neutral-800 hover:border-emerald-500/50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-emerald-500 font-bold border border-neutral-700">
                          {item.name.charAt(0)}
                        </div>
                        <p className="font-medium text-white text-sm">{item.name}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Ringtones Section */}
              {(activeTab === 'all' || activeTab === 'ringtones') && results.ringtones.length > 0 && (
                <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
                  <h3 className="font-bold text-zinc-400 text-xs uppercase tracking-wider mb-3 px-1">Ringtones</h3>
                  <div className="space-y-3">
                    {results.ringtones.map((item) => (
                      <RingtoneCard key={item.id} ringtone={item} assignTo={searchParams.get('assignTo') || undefined} />
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <NoResults query={query} />
          )}
        </div>
      ) : (
        /* BROWSE MODE (Empty Query) */
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'all' && (
            <>
              {/* Browse by Mood */}
              <section>
                <h2 className="text-lg font-bold text-white mb-3">Browse by Mood</h2>
                <div className="grid grid-cols-2 gap-3">
                  {MOODS.map((mood) => (
                    <Link
                      key={mood}
                      href={`/mood/${mood.toLowerCase()}`}
                      className="p-4 bg-neutral-800/50 border border-neutral-800 rounded-xl hover:bg-neutral-800 hover:border-emerald-500/50 transition-all group"
                    >
                      <span className="font-bold text-zinc-200 group-hover:text-emerald-400">{mood}</span>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Browse by Era */}
              <section>
                <h2 className="text-lg font-bold text-white mb-3">Browse by Era</h2>
                <div className="grid grid-cols-2 gap-3">
                  {ERAS.map((era) => (
                    <Link
                      key={era.label}
                      href={`/search?q=${era.label}`}
                      className={`p-6 rounded-xl bg-gradient-to-br ${era.color} relative overflow-hidden group shadow-lg`}
                    >
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                      <span className="relative z-10 text-2xl font-black text-white italic tracking-tighter opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all block text-center">
                        {era.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Default Populated Content for Specific Tabs */}
          {activeTab === 'movies' && (
            <section>
              <h3 className="font-bold text-zinc-400 text-xs uppercase tracking-wider mb-3 px-1">Popular Movies</h3>
              <div className="grid grid-cols-2 gap-3">
                {defaults.movies.map((item, idx) => (
                  <Link href={`/movie/${encodeURIComponent(item.movie_name)}`} key={idx} className="flex flex-col gap-2 p-2 bg-neutral-900 rounded-xl border border-neutral-800 hover:border-emerald-500/50 transition-colors group">
                    <div className="relative w-full aspect-[2/3] bg-neutral-800 rounded-lg overflow-hidden shrink-0">
                      {item.poster_url ? <Image src={item.poster_url} alt={item.movie_name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" /> : null}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm truncate">{item.movie_name}</p>
                      <p className="text-[10px] text-zinc-500">{item.movie_year}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'artists' && (
            <section>
              <h3 className="font-bold text-zinc-400 text-xs uppercase tracking-wider mb-3 px-1">Top Artists</h3>
              <div className="flex flex-wrap gap-3">
                {defaults.artists.map((item, idx) => (
                  <Link href={`/artist/${encodeURIComponent(item.name)}`} key={idx} className="flex items-center gap-3 pr-4 pl-2 py-2 bg-neutral-900 rounded-full border border-neutral-800 hover:border-emerald-500/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-emerald-500 font-bold border border-neutral-700">
                      {item.name.charAt(0)}
                    </div>
                    <p className="font-medium text-white text-sm">{item.name}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
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
