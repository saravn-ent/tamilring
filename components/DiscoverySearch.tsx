'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, Film, Mic, Music } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import { splitArtists } from '@/lib/utils';
import { Ringtone } from '@/types';

type Suggestions = {
  movies: any[];
  artists: any[];
  ringtones: any[];
};

export default function DiscoverySearch() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestions>({ movies: [], artists: [], ringtones: [] });
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLFormElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 1) {
        setLoading(true);
        setShowDropdown(true);

        const fetchAll = async () => {
          // 1. Movies
          const { data: movies } = await supabase
            .from('ringtones')
            .select('movie_name, movie_year, poster_url')
            .eq('status', 'approved')
            .ilike('movie_name', `%${searchQuery}%`)
            .limit(5);

          const uniqueMovies = new Map();
          movies?.forEach(m => {
            if (!uniqueMovies.has(m.movie_name)) uniqueMovies.set(m.movie_name, m);
          });

          // 2. Ringtones
          const { data: ringtones } = await supabase
            .from('ringtones')
            .select('*')
            .eq('status', 'approved')
            .ilike('title', `%${searchQuery}%`)
            .limit(5);

          // 3. Artists
          const { data: artistsData } = await supabase
            .from('ringtones')
            .select('singers, music_director')
            .eq('status', 'approved')
            .or(`singers.ilike.%${searchQuery}%,music_director.ilike.%${searchQuery}%`)
            .limit(20);

          const artistSet = new Set<string>();
          artistsData?.forEach(r => {
            splitArtists(r.singers).forEach(s => artistSet.add(s));
            if (r.music_director) splitArtists(r.music_director).forEach(s => artistSet.add(s));
          });

          const matchedArtists = Array.from(artistSet)
            .filter(a => a.toLowerCase().includes(searchQuery.toLowerCase()))
            .slice(0, 5)
            .map(a => ({ name: a }));

          setSuggestions({
            movies: Array.from(uniqueMovies.values()),
            ringtones: ringtones || [],
            artists: matchedArtists
          });
          setLoading(false);
        };
        fetchAll();
      } else {
        setSuggestions({ movies: [], artists: [], ringtones: [] });
        setLoading(false);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const hasSuggestions = suggestions.movies.length > 0 || suggestions.artists.length > 0 || suggestions.ringtones.length > 0;

  return (
    <form ref={wrapperRef} onSubmit={handleSearch} className="relative mb-8 group z-50">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => { if (searchQuery.length > 1) setShowDropdown(true); }}
        placeholder="Find rings, artists, or bgm..."
        className="w-full bg-white dark:bg-neutral-800/50 backdrop-blur-md border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white text-sm rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-lg shadow-black/5 dark:shadow-black/20 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
      />
      {loading && (
        <div className="absolute inset-y-0 right-4 flex items-center">
          <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
        </div>
      )}

      {/* Autocomplete Dropdown */}
      {showDropdown && hasSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 divide-y divide-white/5 max-h-[60vh] overflow-y-auto custom-scrollbar">

          {/* Movies Section */}
          {suggestions.movies.length > 0 && (
            <div className="p-2">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-2 py-1 mb-1 flex items-center gap-1">
                <Film size={10} /> Movies
              </h3>
              {suggestions.movies.map((movie, idx) => (
                <Link
                  key={idx}
                  href={`/movie/${encodeURIComponent(movie.movie_name)}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
                  onClick={() => setShowDropdown(false)}
                >
                  <div className="relative w-8 h-12 bg-neutral-800 rounded overflow-hidden shrink-0">
                    {movie.poster_url ? (
                      <Image src={movie.poster_url} alt={movie.movie_name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600 font-bold text-xs">{movie.movie_name[0]}</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-200 group-hover:text-emerald-400 truncate">{movie.movie_name}</p>
                    <p className="text-[10px] text-zinc-500">{movie.movie_year}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Artists Section */}
          {suggestions.artists.length > 0 && (
            <div className="p-2 bg-neutral-900/50">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-2 py-1 mb-1 flex items-center gap-1">
                <Mic size={10} /> Artists
              </h3>
              <div className="grid grid-cols-2 gap-1">
                {suggestions.artists.map((artist, idx) => (
                  <Link
                    key={idx}
                    href={`/artist/${encodeURIComponent(artist.name)}`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] text-emerald-500 font-bold shrink-0 border border-white/5">
                      {artist.name[0]}
                    </div>
                    <span className="text-xs font-medium text-zinc-300 truncate">{artist.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Ringtones Section */}
          {suggestions.ringtones.length > 0 && (
            <div className="p-2">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-2 py-1 mb-1 flex items-center gap-1">
                <Music size={10} /> Ringtones
              </h3>
              {suggestions.ringtones.map((ringtone) => (
                <Link
                  key={ringtone.id}
                  href={`/ringtone/${ringtone.slug}`} // Assuming slug exists, otherwise use ID logic or whatever page uses
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group"
                  onClick={() => setShowDropdown(false)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 text-zinc-500 group-hover:text-emerald-500 transition-colors">
                      <Music size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-200 group-hover:text-emerald-400 truncate">{ringtone.title}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{ringtone.movie_name}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <Link
            href={`/search?q=${encodeURIComponent(searchQuery)}`}
            className="block p-3 text-center text-xs font-medium text-emerald-500 hover:bg-emerald-500/10 transition-colors"
            onClick={() => setShowDropdown(false)}
          >
            See all results for "{searchQuery}"
          </Link>
        </div>
      )}
    </form>
  );
}
