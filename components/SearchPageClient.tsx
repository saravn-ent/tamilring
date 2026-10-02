'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Clock,
    X,
    ChevronDown,
    Check,
    Film,
    Mic,
    User,
    Sparkles,
    Loader2,
    TrendingUp,
} from 'lucide-react';
import RingtoneCard from '@/components/RingtoneCard';
import TMDBImage from '@/components/TMDBImage';
import NoResults from '@/components/NoResults';
import { M3SearchBar, M3Chip, M3Card } from '@/components/ui/m3';
import { Ringtone } from '@/types';
import { MOODS, ERAS, INSTRUMENTS } from '@/lib/constants';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';
import { logSearch } from '@/app/actions/ringtones';
import { SearchMovie, SearchArtist, SearchActor } from '@/lib/searchEngine';

const RECENT_SEARCHES_KEY = 'tamilring_recent_searches';
const MAX_RECENT_SEARCHES = 8;

const TRENDING_TAGS = [
    'Leo',
    'Jailer',
    'Anirudh',
    'A.R. Rahman',
    'Mass BGM',
    'Love Melody',
    'Violin',
    '90s Hits',
    'Rajinikanth',
    'Yuvan',
];

interface SearchData {
    ringtones: Ringtone[];
    movies: SearchMovie[];
    artists: SearchArtist[];
    actors: SearchActor[];
    totalRingtones: number;
    hasMore: boolean;
    matchedEra?: string;
    matchedInstrument?: string;
    matchedMood?: string;
}

function SearchPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // URL state
    const urlQuery = searchParams.get('q') || '';
    const urlTab = (searchParams.get('tab') || 'all') as 'all' | 'ringtones' | 'movies' | 'artists' | 'actors';
    const urlSort = (searchParams.get('sort') || 'downloads') as 'downloads' | 'recent' | 'likes' | 'year_desc' | 'year_asc';
    const assignTo = searchParams.get('assignTo') || undefined;

    // Local Search State
    const [query, setQuery] = useState(urlQuery);
    const [activeTab, setActiveTab] = useState<'all' | 'ringtones' | 'movies' | 'artists' | 'actors'>(urlTab);
    const [sortBy, setSortBy] = useState<'downloads' | 'recent' | 'likes' | 'year_desc' | 'year_asc'>(urlSort);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const sortDropdownRef = useRef<HTMLDivElement>(null);

    // Results State
    const [results, setResults] = useState<SearchData>({
        ringtones: [],
        movies: [],
        artists: [],
        actors: [],
        totalRingtones: 0,
        hasMore: false,
    });

    // Defaults for Browse mode (empty query)
    const [defaults, setDefaults] = useState<{
        ringtones: Ringtone[];
        movies: SearchMovie[];
        artists: SearchArtist[];
        actors: SearchActor[];
    }>({
        ringtones: [],
        movies: [],
        artists: [],
        actors: [],
    });

    // Recent Searches State
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    // 1. Load Recent Searches from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setRecentSearches(parsed.slice(0, MAX_RECENT_SEARCHES));
                }
            }
        } catch (e) {
            console.error('Failed to read recent searches:', e);
        }
    }, []);

    const saveRecentSearch = useCallback((searchTerm: string) => {
        const clean = searchTerm.trim();
        if (!clean || clean.length < 2) return;

        setRecentSearches((prev) => {
            const filtered = prev.filter((item) => item.toLowerCase() !== clean.toLowerCase());
            const updated = [clean, ...filtered].slice(0, MAX_RECENT_SEARCHES);
            try {
                localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
            } catch (e) {
                console.error('Failed to save recent search:', e);
            }
            return updated;
        });
    }, []);

    const removeRecentSearch = (e: React.MouseEvent, termToRemove: string) => {
        e.stopPropagation();
        setRecentSearches((prev) => {
            const updated = prev.filter((t) => t !== termToRemove);
            try {
                localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
            } catch (err) {
                console.error('Failed to update recent searches:', err);
            }
            return updated;
        });
    };

    const clearAllRecentSearches = () => {
        setRecentSearches([]);
        try {
            localStorage.removeItem(RECENT_SEARCHES_KEY);
        } catch (err) {
            console.error('Failed to clear recent searches:', err);
        }
    };

    // 2. Fetch Browse Mode Defaults (once on mount)
    useEffect(() => {
        const fetchDefaults = async () => {
            try {
                const res = await fetch('/api/search?defaults=true');
                const data = await res.json();
                if (data.success) {
                    setDefaults({
                        ringtones: data.ringtones || [],
                        movies: data.movies || [],
                        artists: data.artists || [],
                        actors: data.actors || [],
                    });
                }
            } catch (e) {
                console.error('Failed to fetch browse defaults:', e);
            }
        };
        fetchDefaults();
    }, []);

    // 3. Close Sort Dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
                setIsSortOpen(false);
            }
        };
        if (isSortOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSortOpen]);

    // 4. Synchronize URL query parameters smoothly without reloading
    const syncURL = useCallback((q: string, tab: string, sort: string) => {
        const params = new URLSearchParams();
        if (q.trim()) params.set('q', q.trim());
        if (tab !== 'all') params.set('tab', tab);
        if (sort !== 'downloads') params.set('sort', sort);
        if (assignTo) params.set('assignTo', assignTo);

        const newUrl = params.toString() ? `/search?${params.toString()}` : '/search';
        window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    }, [assignTo]);

    // 5. Main Search Fetcher (Debounced)
    useEffect(() => {
        const cleanQ = query.trim();

        if (!cleanQ) {
            setLoading(false);
            setResults({
                ringtones: [],
                movies: [],
                artists: [],
                actors: [],
                totalRingtones: 0,
                hasMore: false,
            });
            syncURL('', activeTab, sortBy);
            return;
        }

        setLoading(true);
        setPage(1);

        const timer = setTimeout(async () => {
            try {
                const params = new URLSearchParams({
                    q: cleanQ,
                    tab: activeTab,
                    sort: sortBy,
                    page: '1',
                    limit: '24',
                });

                const res = await fetch(`/api/search?${params.toString()}`);
                const data = await res.json();

                if (data.success) {
                    setResults({
                        ringtones: data.ringtones || [],
                        movies: data.movies || [],
                        artists: data.artists || [],
                        actors: data.actors || [],
                        totalRingtones: data.totalRingtones || 0,
                        hasMore: Boolean(data.hasMore),
                        matchedEra: data.matchedEra,
                        matchedInstrument: data.matchedInstrument,
                        matchedMood: data.matchedMood,
                    });
                    saveRecentSearch(cleanQ);
                }
            } catch (error) {
                console.error('Search fetch error:', error);
            } finally {
                setLoading(false);
            }

            syncURL(cleanQ, activeTab, sortBy);
        }, 250);

        return () => clearTimeout(timer);
    }, [query, activeTab, sortBy, syncURL, saveRecentSearch]);

    // 6. Log search intent (debounced 2s)
    useEffect(() => {
        if (!query.trim() || query.trim().length <= 2) return;
        const timer = setTimeout(() => {
            logSearch(query.trim());
        }, 2000);
        return () => clearTimeout(timer);
    }, [query]);

    // 7. Load More Pagination
    const handleLoadMore = async () => {
        if (loadingMore || !results.hasMore) return;

        setLoadingMore(true);
        const nextPage = page + 1;

        try {
            const params = new URLSearchParams({
                q: query.trim(),
                tab: activeTab,
                sort: sortBy,
                page: String(nextPage),
                limit: '24',
            });

            const res = await fetch(`/api/search?${params.toString()}`);
            const data = await res.json();

            if (data.success && Array.isArray(data.ringtones)) {
                setResults((prev) => ({
                    ...prev,
                    ringtones: [...prev.ringtones, ...data.ringtones],
                    hasMore: Boolean(data.hasMore),
                }));
                setPage(nextPage);
            }
        } catch (e) {
            console.error('Failed to load more results:', e);
        } finally {
            setLoadingMore(false);
        }
    };

    const hasResults =
        results.ringtones.length > 0 ||
        results.movies.length > 0 ||
        results.artists.length > 0 ||
        results.actors.length > 0;

    const tabs: Array<{ id: 'all' | 'ringtones' | 'movies' | 'artists' | 'actors'; label: string; count?: number }> = [
        { id: 'all', label: 'All' },
        { id: 'ringtones', label: 'Ringtones', count: query.trim() ? results.totalRingtones : defaults.ringtones.length },
        { id: 'movies', label: 'Movies', count: query.trim() ? results.movies.length : defaults.movies.length },
        { id: 'artists', label: 'Artists', count: query.trim() ? results.artists.length : defaults.artists.length },
        { id: 'actors', label: 'Actors', count: query.trim() ? results.actors.length : defaults.actors.length },
    ];

    return (
        <div className="max-w-4xl lg:max-w-5xl mx-auto min-h-screen px-3 sm:px-6 pt-3 pb-32">
            {/* Top Search Input Bar */}
            <div className="mb-4">
                <M3SearchBar
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onClear={() => setQuery('')}
                    showBackButton={true}
                    onBack={() => {
                        if (typeof window !== 'undefined' && window.history.length > 1) {
                            router.back();
                        } else {
                            router.push('/');
                        }
                    }}
                    placeholder="Search songs, movies, artists, actors..."
                    loading={loading}
                    autoFocus
                />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide -mx-1 px-1">
                {tabs.map((tab) => {
                    const isSelected = activeTab === tab.id;
                    return (
                        <M3Chip
                            key={tab.id}
                            variant="filter"
                            label={tab.count !== undefined && tab.count > 0 ? `${tab.label} (${tab.count})` : tab.label}
                            selected={isSelected}
                            onClick={() => {
                                hapticFeedback(hapticPatterns.selection);
                                setActiveTab(tab.id);
                                syncURL(query, tab.id, sortBy);
                            }}
                            className="h-8 text-xs font-semibold shrink-0 cursor-pointer"
                        />
                    );
                })}
            </div>

            {/* ACTIVE SEARCH RESULTS */}
            {query.trim().length > 0 ? (
                <div className="space-y-8">
                    {/* Header: Result count feedback & Sort Control */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-m3-outline-variant/20">
                        <div>
                            <p className="text-xs font-semibold text-m3-on-surface-variant">
                                Results for <span className="text-m3-primary font-bold">&ldquo;{query}&rdquo;</span>
                                {results.totalRingtones > 0 && (
                                    <span className="ml-1.5 text-m3-outline">
                                        ({results.totalRingtones} ringtone{results.totalRingtones === 1 ? '' : 's'})
                                    </span>
                                )}
                            </p>
                        </div>

                        {/* Sort Dropdown (Visible on 'all' and 'ringtones' tabs) */}
                        {(activeTab === 'all' || activeTab === 'ringtones') && results.ringtones.length > 0 && (
                            <div className="relative" ref={sortDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsSortOpen(!isSortOpen)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-m3-surface-container border border-m3-outline-variant/30 text-xs font-semibold text-m3-on-surface hover:bg-m3-surface-container-high transition-colors cursor-pointer"
                                >
                                    <span className="text-m3-outline text-[11px]">Sort:</span>
                                    <span className="text-m3-primary font-bold text-[11px]">
                                        {sortBy === 'recent'
                                            ? 'Recently Added'
                                            : sortBy === 'likes'
                                                ? 'Most Liked'
                                                : sortBy === 'year_desc'
                                                    ? 'Year: Newest'
                                                    : sortBy === 'year_asc'
                                                        ? 'Year: Oldest'
                                                        : 'Most Downloaded'}
                                    </span>
                                    <ChevronDown
                                        size={13}
                                        className={`transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {isSortOpen && (
                                    <div className="absolute right-0 mt-2 w-52 bg-m3-surface-container-high border border-m3-outline-variant/40 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-50 divide-y divide-m3-outline-variant/20">
                                        {[
                                            { id: 'downloads', label: 'Most Downloaded' },
                                            { id: 'recent', label: 'Recently Added' },
                                            { id: 'likes', label: 'Most Liked' },
                                            { id: 'year_desc', label: 'Year: Newest' },
                                            { id: 'year_asc', label: 'Year: Oldest' },
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => {
                                                    hapticFeedback(hapticPatterns.selection);
                                                    setSortBy(opt.id as typeof sortBy);
                                                    setIsSortOpen(false);
                                                }}
                                                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
                                                    sortBy === opt.id
                                                        ? 'bg-m3-secondary-container text-m3-on-secondary-container font-bold'
                                                        : 'text-m3-on-surface hover:bg-m3-surface-container-highest'
                                                }`}
                                            >
                                                <span>{opt.label}</span>
                                                {sortBy === opt.id && <Check size={14} className="text-m3-primary" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Skeletons while fetching */}
                    {loading ? (
                        <div className="space-y-6 animate-pulse">
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="aspect-2/3 bg-m3-surface-container rounded-2xl" />
                                ))}
                            </div>
                            <div className="space-y-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-20 bg-m3-surface-container-low rounded-2xl" />
                                ))}
                            </div>
                        </div>
                    ) : hasResults ? (
                        <>
                            {/* Matching Movies Section */}
                            {(activeTab === 'all' || activeTab === 'movies') && results.movies.length > 0 && (
                                <section>
                                    <h3 className="text-xs font-bold text-m3-outline uppercase tracking-wider mb-3 px-1 flex items-center gap-1.5">
                                        <Film size={13} /> Movies ({results.movies.length})
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                        {results.movies.map((movie, idx) => (
                                            <Link
                                                key={idx}
                                                href={`/movie/${encodeURIComponent(movie.movie_name)}`}
                                                className="group flex flex-col p-2 bg-m3-surface-container-low hover:bg-m3-surface-container rounded-2xl border border-m3-outline-variant/30 transition-all"
                                            >
                                                <div className="relative w-full aspect-2/3 bg-m3-surface-container rounded-xl overflow-hidden shrink-0 border border-m3-outline-variant/30">
                                                    {movie.poster_url ? (
                                                        <TMDBImage
                                                            path={movie.poster_url}
                                                            alt={movie.movie_name}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                            size="w342"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-m3-outline">
                                                            <Film size={24} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-2 min-w-0">
                                                    <p className="text-xs font-semibold text-m3-on-surface group-hover:text-m3-primary truncate transition-colors">
                                                        {movie.movie_name}
                                                    </p>
                                                    <p className="text-[10px] text-m3-outline">{movie.movie_year || 'Movie'}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Matching Artists Section */}
                            {(activeTab === 'all' || activeTab === 'artists') && results.artists.length > 0 && (
                                <section>
                                    <h3 className="text-xs font-bold text-m3-outline uppercase tracking-wider mb-3 px-1 flex items-center gap-1.5">
                                        <Mic size={13} /> Artists & Composers ({results.artists.length})
                                    </h3>
                                    <div className="flex flex-wrap gap-2.5">
                                        {results.artists.map((artist, idx) => (
                                            <Link
                                                key={idx}
                                                href={`/artist/${encodeURIComponent(artist.name)}`}
                                                className="flex items-center gap-2.5 px-3 py-2 bg-m3-surface-container-low hover:bg-m3-surface-container rounded-full border border-m3-outline-variant/30 transition-all group"
                                            >
                                                <div className="w-7 h-7 rounded-full bg-m3-primary-container text-m3-on-primary-container text-xs font-bold flex items-center justify-center shrink-0">
                                                    {artist.name.charAt(0)}
                                                </div>
                                                <span className="text-xs font-medium text-m3-on-surface group-hover:text-m3-primary transition-colors">
                                                    {artist.name}
                                                </span>
                                                {artist.role && (
                                                    <span className="text-[10px] text-m3-outline bg-m3-surface-container px-1.5 py-0.5 rounded-md">
                                                        {artist.role}
                                                    </span>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Matching Actors Section */}
                            {(activeTab === 'all' || activeTab === 'actors') && results.actors.length > 0 && (
                                <section>
                                    <h3 className="text-xs font-bold text-m3-outline uppercase tracking-wider mb-3 px-1 flex items-center gap-1.5">
                                        <User size={13} /> Cast & Actors ({results.actors.length})
                                    </h3>
                                    <div className="flex flex-wrap gap-2.5">
                                        {results.actors.map((actor, idx) => (
                                            <Link
                                                key={idx}
                                                href={`/actor/${encodeURIComponent(actor.name)}`}
                                                className="flex items-center gap-2.5 px-3 py-2 bg-m3-surface-container-low hover:bg-m3-surface-container rounded-full border border-m3-outline-variant/30 transition-all group"
                                            >
                                                <div className="w-7 h-7 rounded-full bg-m3-secondary-container text-m3-on-secondary-container text-xs font-bold flex items-center justify-center shrink-0">
                                                    <User size={14} />
                                                </div>
                                                <span className="text-xs font-medium text-m3-on-surface group-hover:text-m3-primary transition-colors">
                                                    {actor.name}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Matching Ringtones Section */}
                            {(activeTab === 'all' || activeTab === 'ringtones') && results.ringtones.length > 0 && (
                                <section>
                                    {activeTab === 'all' && (
                                        <h3 className="text-xs font-bold text-m3-outline uppercase tracking-wider mb-3 px-1">
                                            Ringtones ({results.totalRingtones})
                                        </h3>
                                    )}
                                    <div className="space-y-3 sm:grid sm:grid-cols-2 sm:space-y-0 sm:gap-4">
                                        {results.ringtones.map((item) => (
                                            <RingtoneCard key={item.id} ringtone={item} assignTo={assignTo} />
                                        ))}
                                    </div>

                                    {/* Load More Pagination Button */}
                                    {results.hasMore && (
                                        <div className="mt-8 text-center">
                                            <button
                                                type="button"
                                                onClick={handleLoadMore}
                                                disabled={loadingMore}
                                                className="px-6 py-2.5 rounded-full bg-m3-surface-container-high hover:bg-m3-surface-container-highest border border-m3-outline-variant/40 text-xs font-bold text-m3-on-surface hover:text-m3-primary transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
                                            >
                                                {loadingMore ? (
                                                    <>
                                                        <Loader2 size={14} className="animate-spin text-m3-primary" />
                                                        <span>Loading more ringtones...</span>
                                                    </>
                                                ) : (
                                                    <span>Load More Ringtones</span>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </section>
                            )}
                        </>
                    ) : (
                        <NoResults query={query} onClear={() => setQuery('')} />
                    )}
                </div>
            ) : (
                /* BROWSE MODE (When Search Input is Empty) */
                <div className="space-y-8 animate-in fade-in duration-300">
                    {/* 1. Recent Searches (if any) */}
                    {activeTab === 'all' && recentSearches.length > 0 && (
                        <section className="space-y-2.5">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-xs font-bold text-m3-outline uppercase tracking-wider flex items-center gap-1.5">
                                    <Clock size={13} /> Recent Searches
                                </h2>
                                <button
                                    type="button"
                                    onClick={clearAllRecentSearches}
                                    className="text-[11px] font-semibold text-m3-outline hover:text-m3-on-surface transition-colors cursor-pointer"
                                >
                                    Clear all
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {recentSearches.map((term) => (
                                    <div
                                        key={term}
                                        onClick={() => {
                                            hapticFeedback(hapticPatterns.selection);
                                            setQuery(term);
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-m3-surface-container border border-m3-outline-variant/30 text-xs font-medium text-m3-on-surface hover:bg-m3-surface-container-high transition-colors cursor-pointer group"
                                    >
                                        <Clock size={11} className="text-m3-outline" />
                                        <span>{term}</span>
                                        <button
                                            type="button"
                                            onClick={(e) => removeRecentSearch(e, term)}
                                            className="w-4 h-4 rounded-full flex items-center justify-center text-m3-outline hover:text-m3-on-surface transition-colors ml-0.5"
                                            aria-label={`Remove ${term}`}
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 2. Trending Kollywood Tags */}
                    {activeTab === 'all' && (
                        <section className="space-y-2.5">
                            <h2 className="text-xs font-bold text-m3-outline uppercase tracking-wider px-1 flex items-center gap-1.5">
                                <TrendingUp size={13} className="text-m3-primary" /> Trending Now
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {TRENDING_TAGS.map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => {
                                            hapticFeedback(hapticPatterns.selection);
                                            setQuery(tag);
                                        }}
                                        className="px-3.5 py-1.5 rounded-full bg-m3-surface-container-low hover:bg-m3-surface-container border border-m3-outline-variant/30 text-xs font-semibold text-m3-on-surface-variant hover:text-m3-primary transition-all cursor-pointer shadow-2xs"
                                    >
                                        #{tag}
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 3. Browse by Mood */}
                    {activeTab === 'all' && (
                        <section className="space-y-2.5">
                            <h2 className="text-xs font-bold text-m3-outline uppercase tracking-wider px-1 flex items-center gap-1.5">
                                <Sparkles size={13} /> Browse by Mood
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {MOODS.map((mood) => (
                                    <M3Chip
                                        key={mood}
                                        variant="assist"
                                        href={`/mood/${mood.toLowerCase()}`}
                                        label={mood}
                                        className="h-8.5 px-3.5 text-xs font-semibold"
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 4. Browse by Era */}
                    {activeTab === 'all' && (
                        <section className="space-y-2.5">
                            <h2 className="text-xs font-bold text-m3-outline uppercase tracking-wider px-1">
                                Browse by Era
                            </h2>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
                                {ERAS.map((era) => (
                                    <button
                                        key={era.label}
                                        type="button"
                                        onClick={() => {
                                            hapticFeedback(hapticPatterns.selection);
                                            setQuery(era.label);
                                        }}
                                        className="text-left cursor-pointer"
                                    >
                                        <M3Card
                                            variant="outlined"
                                            interactive
                                            className="h-16 flex flex-col items-center justify-center bg-m3-surface-container-low hover:bg-m3-surface-container border-m3-outline-variant/30 text-center group"
                                        >
                                            <span className="text-base font-bold text-m3-on-surface group-hover:text-m3-primary transition-colors">
                                                {era.label}
                                            </span>
                                            <span className="text-[10px] text-m3-outline">Hits</span>
                                        </M3Card>
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 5. Browse by Instrument */}
                    {activeTab === 'all' && (
                        <section className="space-y-2.5">
                            <h2 className="text-xs font-bold text-m3-outline uppercase tracking-wider px-1">
                                Browse Instruments
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {INSTRUMENTS.map((inst) => (
                                    <button
                                        key={inst.label}
                                        type="button"
                                        onClick={() => {
                                            hapticFeedback(hapticPatterns.selection);
                                            setQuery(inst.label);
                                        }}
                                        className="px-3 py-1.5 rounded-full bg-m3-surface-container-low hover:bg-m3-surface-container border border-m3-outline-variant/30 text-xs font-medium text-m3-on-surface hover:text-m3-primary transition-colors cursor-pointer"
                                    >
                                        {inst.label}
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* POPULATED DEFAULTS FOR INDIVIDUAL TABS (PREVENTS EMPTY SCREENS!) */}

                    {/* 'ringtones' tab in browse mode */}
                    {activeTab === 'ringtones' && (
                        <section className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-xs font-bold text-m3-outline uppercase tracking-wider">
                                    Popular Ringtones ({defaults.ringtones.length})
                                </h3>
                            </div>
                            <div className="space-y-3 sm:grid sm:grid-cols-2 sm:space-y-0 sm:gap-4">
                                {defaults.ringtones.map((item) => (
                                    <RingtoneCard key={item.id} ringtone={item} assignTo={assignTo} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 'movies' tab in browse mode */}
                    {activeTab === 'movies' && (
                        <section className="space-y-4">
                            <h3 className="text-xs font-bold text-m3-outline uppercase tracking-wider px-1">
                                Popular Movies ({defaults.movies.length})
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {defaults.movies.map((movie, idx) => (
                                    <Link
                                        key={idx}
                                        href={`/movie/${encodeURIComponent(movie.movie_name)}`}
                                        className="group flex flex-col p-2 bg-m3-surface-container-low hover:bg-m3-surface-container rounded-2xl border border-m3-outline-variant/30 transition-all"
                                    >
                                        <div className="relative w-full aspect-2/3 bg-m3-surface-container rounded-xl overflow-hidden shrink-0 border border-m3-outline-variant/30">
                                            {movie.poster_url ? (
                                                <TMDBImage
                                                    path={movie.poster_url}
                                                    alt={movie.movie_name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    size="w342"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-m3-outline">
                                                    <Film size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-2 min-w-0">
                                            <p className="text-xs font-semibold text-m3-on-surface group-hover:text-m3-primary truncate transition-colors">
                                                {movie.movie_name}
                                            </p>
                                            <p className="text-[10px] text-m3-outline">{movie.movie_year || 'Movie'}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 'artists' tab in browse mode */}
                    {activeTab === 'artists' && (
                        <section className="space-y-4">
                            <h3 className="text-xs font-bold text-m3-outline uppercase tracking-wider px-1">
                                Top Artists & Composers ({defaults.artists.length})
                            </h3>
                            <div className="flex flex-wrap gap-2.5">
                                {defaults.artists.map((artist, idx) => (
                                    <Link
                                        key={idx}
                                        href={`/artist/${encodeURIComponent(artist.name)}`}
                                        className="flex items-center gap-2.5 px-3 py-2 bg-m3-surface-container-low hover:bg-m3-surface-container rounded-full border border-m3-outline-variant/30 transition-all group"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-m3-primary-container text-m3-on-primary-container text-xs font-bold flex items-center justify-center shrink-0">
                                            {artist.name.charAt(0)}
                                        </div>
                                        <span className="text-xs font-medium text-m3-on-surface group-hover:text-m3-primary transition-colors">
                                            {artist.name}
                                        </span>
                                        {artist.role && (
                                            <span className="text-[10px] text-m3-outline bg-m3-surface-container px-1.5 py-0.5 rounded-md">
                                                {artist.role}
                                            </span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 'actors' tab in browse mode */}
                    {activeTab === 'actors' && (
                        <section className="space-y-4">
                            <h3 className="text-xs font-bold text-m3-outline uppercase tracking-wider px-1">
                                Top Kollywood Stars ({defaults.actors.length})
                            </h3>
                            <div className="flex flex-wrap gap-2.5">
                                {defaults.actors.map((actor, idx) => (
                                    <Link
                                        key={idx}
                                        href={`/actor/${encodeURIComponent(actor.name)}`}
                                        className="flex items-center gap-2.5 px-3 py-2 bg-m3-surface-container-low hover:bg-m3-surface-container rounded-full border border-m3-outline-variant/30 transition-all group"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-m3-secondary-container text-m3-on-secondary-container text-xs font-bold flex items-center justify-center shrink-0">
                                            <User size={14} />
                                        </div>
                                        <span className="text-xs font-medium text-m3-on-surface group-hover:text-m3-primary transition-colors">
                                            {actor.name}
                                        </span>
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

export default function SearchPageClient() {
    return (
        <Suspense
            fallback={
                <div className="max-w-4xl mx-auto px-4 py-8 text-center text-m3-outline">
                    <Loader2 size={24} className="animate-spin mx-auto text-m3-primary mb-2" />
                    <p className="text-xs">Loading Search...</p>
                </div>
            }
        >
            <SearchPageContent />
        </Suspense>
    );
}
