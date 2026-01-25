'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { Search, Loader2, ChevronDown, Check } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import RingtoneCard from '@/components/RingtoneCard';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { splitArtists, fuzzySearchPattern } from '@/lib/utils';
import { sanitizeSearchQuery } from '@/lib/sanitize';
import { getImageUrl } from '@/lib/tmdb';
import TMDBImage from './TMDBImage';
import { MOODS, ERAS, INSTRUMENTS } from '@/lib/constants';
import NoResults from '@/components/NoResults';
import SortControl from './SortControl';
import { hapticFeedback } from '@/lib/haptics';


function SearchContent() {
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [loading, setLoading] = useState(false);

    // Sorting State
    const [sortBy, setSortBy] = useState<'recent' | 'downloads' | 'likes' | 'year_desc' | 'year_asc'>('downloads');
    const [isSortOpen, setIsSortOpen] = useState(false);
    const sortDropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
                setIsSortOpen(false);
            }
        };

        if (isSortOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSortOpen]);

    // Results State
    const [results, setResults] = useState<{
        ringtones: any[];
        movies: any[];
        artists: any[];
    }>({ ringtones: [], movies: [], artists: [] });

    const [activeTab, setActiveTab] = useState<'all' | 'ringtones' | 'movies' | 'artists'>(
        searchParams.get('hideSearch') ? 'ringtones' : 'all'
    );

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

                    // Text Search Logic: Relaxed for better "related" results on typos
                    const parts = safeQuery.split(/\s+/).filter(p => p.length > 1);

                    if (matchedEra) {
                        // Era Filtering
                        dbQuery = dbQuery
                            .gte('movie_year', matchedEra.startYear)
                            .lte('movie_year', matchedEra.endYear);
                    } else if (parts.length > 0) {
                        // Multi-word fuzzy search
                        const conditions = parts.map(p => {
                            const fp = fuzzySearchPattern(p);
                            return `title.ilike.${fp},movie_name.ilike.${fp},singers.ilike.${fp},music_director.ilike.${fp}`;
                        }).join(',');
                        dbQuery = dbQuery.or(conditions);
                    } else {
                        // Single keyword fuzzy search
                        const fp = fuzzySearchPattern(safeQuery);
                        dbQuery = dbQuery.or(`title.ilike.${fp},movie_name.ilike.${fp},singers.ilike.${fp},music_director.ilike.${fp}`);
                    }

                    // Apply Sorting
                    if (sortBy === 'recent') {
                        dbQuery = dbQuery.order('created_at', { ascending: false });
                    } else if (sortBy === 'likes') {
                        dbQuery = dbQuery.order('likes', { ascending: false });
                    } else if (sortBy === 'year_desc') {
                        dbQuery = dbQuery.order('movie_year', { ascending: false });
                    } else if (sortBy === 'year_asc') {
                        dbQuery = dbQuery.order('movie_year', { ascending: true });
                    } else {
                        // Default to downloads
                        dbQuery = dbQuery.order('downloads', { ascending: false });
                    }

                    const { data } = await dbQuery.limit(30); // Increased limit for broader related results
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
                        const parts = safeQuery.split(/\s+/).filter(p => p.length > 1);
                        if (parts.length > 0) {
                            const conditions = parts.map(p => `movie_name.ilike.${fuzzySearchPattern(p)}`).join(',');
                            dbQuery = dbQuery.or(conditions).limit(30);
                        } else {
                            dbQuery = dbQuery.ilike('movie_name', fuzzySearchPattern(safeQuery)).limit(20);
                        }
                    }

                    const { data } = await dbQuery;

                    const uniqueMovies = new Map();
                    data?.forEach(item => {
                        if (!uniqueMovies.has(item.movie_name)) uniqueMovies.set(item.movie_name, item);
                    });
                    return Array.from(uniqueMovies.values());
                };

                const fetchArtists = async () => {
                    if (matchedEra) {
                        return [];
                    }

                    // SECURITY: Sanitize user input to prevent SQL injection
                    const safeQuery = sanitizeSearchQuery(query);

                    const parts = safeQuery.split(/\s+/).filter(p => p.length > 1);
                    const conditions = parts.length > 0
                        ? parts.map(p => {
                            const fp = fuzzySearchPattern(p);
                            return `singers.ilike.${fp},music_director.ilike.${fp}`;
                        }).join(',')
                        : (function () {
                            const fp = fuzzySearchPattern(safeQuery);
                            return `singers.ilike.${fp},music_director.ilike.${fp}`;
                        })();

                    const { data } = await supabase
                        .from('ringtones')
                        .select('singers, music_director')
                        .eq('status', 'approved')
                        .or(conditions)
                        .limit(30);

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
    }, [query, activeTab, sortBy]);

    const hasResults = results.ringtones.length > 0 || results.movies.length > 0 || results.artists.length > 0;
    const matchedEra = ERAS.find(e => e.label.toLowerCase() === query.toLowerCase());
    const matchedInstrument = INSTRUMENTS.find(i => i.query.toLowerCase() === query.toLowerCase() || i.label.toLowerCase() === query.toLowerCase());
    const isSpecialSearch = searchParams.get('hideSearch') && (matchedEra || matchedInstrument);

    const tabs = ['all', 'ringtones', 'movies', 'artists'].filter(tab => {
        if (matchedEra && tab === 'artists') return false;
        return true;
    });

    return (
        <div className="max-w-md mx-auto min-h-screen bg-white pb-24">
            {isSpecialSearch && (
                <div className="p-6 pt-8 bg-gradient-to-b from-brand-wash to-white">
                    <h1 className="text-3xl font-bold text-brand-dark capitalize tracking-tight">
                        {matchedEra ? matchedEra.label : matchedInstrument?.label}
                    </h1>
                    <p className="text-zinc-600 text-sm mt-1 font-medium">
                        Best {matchedEra ? matchedEra.label : matchedInstrument?.label} Ringtones
                    </p>
                </div>
            )}

            <div className="px-4 pt-4">

                {/* Search Input */
                    !searchParams.get('hideSearch') && (
                        <div className="relative mb-6">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search rings, movies, artists..."
                                className="w-full bg-white border border-brand-gray rounded-xl px-12 py-4 text-lg text-brand-dark focus:outline-none focus:border-brand-blue transition-colors shadow-sm placeholder:text-zinc-500"
                                autoFocus
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                            {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-blue animate-spin" />}
                        </div>
                    )}

                {/* Tabs (Always Visible) */
                    !searchParams.get('hideSearch') && (
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        hapticFeedback(10);
                                        setActiveTab(tab as any);
                                    }}
                                    className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors border ${activeTab === tab
                                        ? 'bg-brand-blue text-white border-brand-blue'
                                        : 'bg-white text-zinc-600 border-brand-gray hover:border-zinc-400'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    )}

                {query.length > 1 ? (
                    /* ... SEARCH RESULTS ... */
                    <div className="space-y-8">
                        {/* Sort Options (Visible mostly when browsing categories) */
                            (activeTab === 'all' || activeTab === 'ringtones') && (
                                <div className="flex justify-end mb-4 relative z-20">
                                    <div className="relative" ref={sortDropdownRef}>
                                        <button
                                            onClick={() => setIsSortOpen(!isSortOpen)}
                                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-brand-border text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-brand-dark transition-all shadow-sm hover:shadow-md"
                                        >
                                            Sort: <span className="text-brand-accent">
                                                {sortBy === 'recent' ? 'Recently Added' :
                                                    sortBy === 'likes' ? 'Most Liked' :
                                                        sortBy === 'year_desc' ? 'Year: Newest' :
                                                            sortBy === 'year_asc' ? 'Year: Oldest' :
                                                                'Most Downloaded'}
                                            </span>
                                            <ChevronDown
                                                size={14}
                                                className={`transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`}
                                            />
                                        </button>

                                        {isSortOpen && (
                                            <div className="absolute right-0 mt-2 w-56 bg-white border border-brand-border rounded-xl shadow-xl shadow-brand-dark/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                                <div className="py-1">
                                                    {[
                                                        { id: 'recent', label: 'Recently Added' },
                                                        { id: 'downloads', label: 'Most Downloaded' },
                                                        { id: 'likes', label: 'Most Liked' },
                                                        { id: 'year_desc', label: 'Year: Newest' },
                                                        { id: 'year_asc', label: 'Year: Oldest' }
                                                    ].map((opt) => (
                                                        <button
                                                            key={opt.id}
                                                            onClick={() => {
                                                                hapticFeedback(10);
                                                                setSortBy(opt.id as any);
                                                                setIsSortOpen(false);
                                                            }}
                                                            className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${sortBy === opt.id
                                                                ? 'bg-brand-wash text-brand-accent'
                                                                : 'text-zinc-600 hover:bg-zinc-50 hover:text-brand-dark'
                                                                } border-b border-zinc-50 last:border-0`}
                                                        >
                                                            <span>{opt.label}</span>
                                                            {sortBy === opt.id && (
                                                                <Check size={16} className="text-brand-accent" />
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        {loading ? (
                            /* SKELETONS */
                            <div className="animate-pulse space-y-8">
                                {/* Movie Skeleton */}
                                {(activeTab === 'all' || activeTab === 'movies') && (
                                    <div className="space-y-3">
                                        <div className="h-4 w-20 bg-zinc-200 rounded ml-1" />
                                        <div className="grid grid-cols-2 gap-3">
                                            {[1, 2].map(i => (
                                                <div key={i} className="aspect-[2/3] bg-zinc-100 rounded-xl border border-brand-gray" />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* Ringtone Skeleton */}
                                {(activeTab === 'all' || activeTab === 'ringtones') && (
                                    <div className="space-y-3">
                                        <div className="h-4 w-24 bg-zinc-200 rounded ml-1" />
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-20 bg-white rounded-xl border border-brand-gray" />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : hasResults ? (
                            <>
                                {/* Movies Section */}
                                {(activeTab === 'all' || activeTab === 'movies') && results.movies.length > 0 && (
                                    <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <h3 className="font-bold text-zinc-600 text-xs uppercase tracking-wider mb-3 px-1">
                                            {ERAS.find(e => e.label.toLowerCase() === query.toLowerCase()) ? `${query} Movies` : (activeTab === 'all' ? 'Movies' : 'Matching Movies')}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {results.movies.map((item, idx) => (
                                                <Link href={`/movie/${encodeURIComponent(item.movie_name)}`} key={idx} className="flex flex-col gap-2 p-2 bg-white rounded-xl border border-brand-gray hover:shadow-lg transition-all group">
                                                    <div className="relative w-full aspect-[2/3] bg-zinc-100 rounded-lg overflow-hidden shrink-0">
                                                        <TMDBImage
                                                            path={item.poster_url}
                                                            alt={item.movie_name}
                                                            fill
                                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-brand-dark text-sm truncate">{item.movie_name}</p>
                                                        <p className="text-[10px] text-zinc-600">{item.movie_year}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Artists Section */}
                                {(activeTab === 'all' || activeTab === 'artists') && results.artists.length > 0 && (
                                    <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
                                        <h3 className="font-bold text-zinc-600 text-xs uppercase tracking-wider mb-3 px-1">Artists</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {results.artists.map((item, idx) => (
                                                <Link href={`/artist/${encodeURIComponent(item.name)}`} key={idx} className="flex items-center gap-3 pr-4 pl-2 py-2 bg-white rounded-full border border-brand-gray hover:border-brand-blue transition-colors">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-brand-blue font-bold border border-zinc-200">
                                                        {item.name.charAt(0)}
                                                    </div>
                                                    <p className="font-medium text-brand-dark text-sm">{item.name}</p>
                                                </Link>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Ringtones Section */}
                                {(activeTab === 'all' || activeTab === 'ringtones') && results.ringtones.length > 0 && (
                                    <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
                                        {!isSpecialSearch && (
                                            <h3 className="font-bold text-zinc-600 text-xs uppercase tracking-wider mb-3 px-1">Ringtones</h3>
                                        )}
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
                                    <h2 className="text-lg font-bold text-[#15171A] mb-3">Browse by Mood</h2>
                                    <div className="grid grid-cols-2 gap-3">
                                        {MOODS.map((mood) => (
                                            <Link
                                                key={mood}
                                                href={`/mood/${mood.toLowerCase()}`}
                                                onClick={() => hapticFeedback(10)}
                                                className="p-4 bg-white border border-[#E5EBF1] rounded-xl hover:shadow-md transition-all group"
                                            >
                                                <span className="font-bold text-zinc-700 group-hover:text-brand-accent">{mood}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </section>

                                {/* Browse by Era */}
                                <section>
                                    <h2 className="text-lg font-bold text-[#15171A] mb-3">Browse by Era</h2>
                                    <div className="grid grid-cols-2 gap-3">
                                        {ERAS.map((era) => (
                                            <Link
                                                key={era.label}
                                                href={`/search?q=${era.label}&hideSearch=true`}
                                                onClick={() => hapticFeedback(15)}
                                                className={`p-6 rounded-xl bg-gradient-to-br ${era.color} relative overflow-hidden group shadow-sm hover:shadow-lg transition-shadow`}
                                            >
                                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                                                <span className="relative z-10 text-2xl font-black text-white italic tracking-tighter opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all block text-center shadow-sm">
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
                                <h3 className="font-bold text-zinc-600 text-xs uppercase tracking-wider mb-3 px-1">Popular Movies</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {defaults.movies.map((item, idx) => (
                                        <Link href={`/movie/${encodeURIComponent(item.movie_name)}`} key={idx} className="flex flex-col gap-2 p-2 bg-white rounded-xl border border-[#E5EBF1] hover:shadow-lg transition-all group">
                                            <div className="relative w-full aspect-[2/3] bg-zinc-100 rounded-lg overflow-hidden shrink-0">
                                                <TMDBImage
                                                    path={item.poster_url}
                                                    alt={item.movie_name}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#15171A] text-sm truncate">{item.movie_name}</p>
                                                <p className="text-[10px] text-zinc-500">{item.movie_year}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {activeTab === 'artists' && (
                            <section>
                                <h3 className="font-bold text-zinc-600 text-xs uppercase tracking-wider mb-3 px-1">Top Artists</h3>
                                <div className="flex flex-wrap gap-3">
                                    {defaults.artists.map((item, idx) => (
                                        <Link href={`/artist/${encodeURIComponent(item.name)}`} key={idx} className="flex items-center gap-3 pr-4 pl-2 py-2 bg-white rounded-full border border-[#E5EBF1] hover:border-brand-accent transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-brand-blue font-bold border border-zinc-200">
                                                {item.name.charAt(0)}
                                            </div>
                                            <p className="font-medium text-[#15171A] text-sm">{item.name}</p>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}


export default function SearchPageClient() {
    return (
        <Suspense fallback={<div className="p-4 text-center text-zinc-500">Loading search...</div>}>
            <SearchContent />
        </Suspense>
    );
}
