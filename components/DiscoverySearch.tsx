'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, Film, Mic, Music } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import { splitArtists, fuzzySearchPattern } from '@/lib/utils';
import { getImageUrl } from '@/lib/tmdb';
import { Ringtone } from '@/types';

type Suggestions = {
  movies: any[];
  artists: any[];
  ringtones: any[];
};

export default function DiscoverySearch({ className = "mb-8" }: { className?: string }) {
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
          const safeQuery = searchQuery.trim();
          const parts = safeQuery.split(/\s+/).filter(p => p.length > 1);

          // Build a more permissive OR query for better "related" results
          // This handles cases where user types "Mankatha Anirudh" or "Manka" (partial)
          // Optimized for Tamil transliteration typos (e.g. varanam vs vaaranam)
          const searchFilter = parts.length > 0
            ? parts.map(p => {
              const fp = fuzzySearchPattern(p);
              return `title.ilike.${fp},movie_name.ilike.${fp},singers.ilike.${fp},music_director.ilike.${fp},movie_director.ilike.${fp}`;
            }).join(',')
            : (function () {
              const fp = fuzzySearchPattern(safeQuery);
              return `title.ilike.${fp},movie_name.ilike.${fp},singers.ilike.${fp},music_director.ilike.${fp},movie_director.ilike.${fp}`;
            })();

          // 1. Fetch Ringtones with permissive search
          const { data: ringtones } = await supabase
            .from('ringtones')
            .select('*')
            .eq('status', 'approved')
            .or(searchFilter)
            .order('downloads', { ascending: false })
            .limit(10);

          // 2. Extract unique movies and all artists (singers, music directors, movie directors) from the results
          // This ensures "related" content is always relevant to what was found
          const uniqueMoviesMap = new Map();
          const artistsSet = new Set<string>();

          ringtones?.forEach(r => {
            if (r.movie_name && !uniqueMoviesMap.has(r.movie_name)) {
              uniqueMoviesMap.set(r.movie_name, {
                movie_name: r.movie_name,
                movie_year: r.movie_year,
                poster_url: r.poster_url
              });
            }
            // Combine all artists into one set
            if (r.singers) splitArtists(r.singers).forEach(s => artistsSet.add(s));
            if (r.music_director) splitArtists(r.music_director).forEach(s => artistsSet.add(s));
            if (r.movie_director) splitArtists(r.movie_director).forEach(s => artistsSet.add(s));
          });

          // 3. Supplemental check for movies/artists if ringtones are scarce
          // This helps when the user types just a movie name with a typo
          if (uniqueMoviesMap.size < 3) {
            const { data: moreMovies } = await supabase
              .from('ringtones')
              .select('movie_name, movie_year, poster_url')
              .eq('status', 'approved')
              .or(parts.length > 0 ? parts.map(p => `movie_name.ilike.%${p}%`).join(',') : `movie_name.ilike.%${safeQuery}%`)
              .limit(5);

            moreMovies?.forEach(m => {
              if (!uniqueMoviesMap.has(m.movie_name)) uniqueMoviesMap.set(m.movie_name, m);
            });
          }

          setSuggestions({
            movies: Array.from(uniqueMoviesMap.values()).slice(0, 5),
            ringtones: ringtones?.slice(0, 5) || [],
            artists: Array.from(artistsSet)
              .filter(a => parts.length === 0 || parts.some(p => a.toLowerCase().includes(p.toLowerCase())))
              .slice(0, 6)
              .map(a => ({ name: a }))
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
    <form ref={wrapperRef} onSubmit={handleSearch} className={`relative group z-50 ${className}`}>
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-zinc-400 group-focus-within:text-brand-blue transition-colors" />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => { if (searchQuery.length > 1) setShowDropdown(true); }}
        placeholder="Find rings, artists, or bgm..."
        className="w-full bg-white border border-brand-gray text-zinc-900 text-sm rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all shadow-sm placeholder:text-zinc-400"
      />
      {loading && (
        <div className="absolute inset-y-0 right-4 flex items-center">
          <Loader2 className="h-5 w-5 text-brand-blue animate-spin" />
        </div>
      )}

      {/* Autocomplete Dropdown */}
      {showDropdown && hasSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-brand-gray rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 divide-y divide-brand-gray max-h-[60vh] overflow-y-auto custom-scrollbar">

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
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-brand-wash transition-colors group"
                  onClick={() => setShowDropdown(false)}
                >
                  <div className="relative w-8 h-12 bg-white rounded overflow-hidden shrink-0 border border-brand-gray/50">
                    {movie.poster_url ? (
                      <Image src={getImageUrl(movie.poster_url)} alt={movie.movie_name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold text-xs">{movie.movie_name[0]}</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-brand-dark group-hover:text-brand-blue truncate">{movie.movie_name}</p>
                    <p className="text-[10px] text-zinc-500">{movie.movie_year}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Artists Section (Combined: Singers, Music Directors, Movie Directors) */}
          {suggestions.artists.length > 0 && (
            <div className="p-2 bg-brand-wash/30">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-2 py-1 mb-1 flex items-center gap-1">
                <Mic size={10} /> Artists
              </h3>
              <div className="grid grid-cols-2 gap-1">
                {suggestions.artists.map((artist: any, idx: number) => (
                  <Link
                    key={idx}
                    href={`/artist/${encodeURIComponent(artist.name)}`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-brand-wash transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[10px] text-brand-blue font-bold shrink-0 border border-brand-gray">
                      {artist.name[0]}
                    </div>
                    <span className="text-xs font-medium text-zinc-600 truncate">{artist.name}</span>
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
                  href={`/ringtone/${ringtone.slug}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-brand-wash transition-colors group"
                  onClick={() => setShowDropdown(false)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-brand-wash flex items-center justify-center shrink-0 text-zinc-400 group-hover:text-brand-blue transition-colors">
                      <Music size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-brand-dark group-hover:text-brand-blue truncate">{ringtone.title}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{ringtone.movie_name}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <Link
            href={`/search?q=${encodeURIComponent(searchQuery)}`}
            className="block p-3 text-center text-xs font-bold text-brand-blue hover:bg-brand-wash transition-colors"
            onClick={() => setShowDropdown(false)}
          >
            See all results for "{searchQuery}"
          </Link>
        </div>
      )}
    </form>
  );
}
