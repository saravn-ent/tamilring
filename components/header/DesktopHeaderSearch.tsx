'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    X,
    Loader2,
    Music,
    Film,
    Mic,
    User,
    Play,
    Pause,
    ArrowRight,
    Clock,
    TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import type { SuggestionItem } from '@/types';
import { usePlayer } from '@/context/PlayerContext';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';
import { getImageUrl } from '@/lib/tmdb';

const RECENT_SEARCHES_KEY = 'tamilring_recent_searches';
const QUICK_TRENDING = ['Leo', 'Jailer', 'Anirudh', 'A.R. Rahman', 'Mass BGM', 'Violin'];

export default function DesktopHeaderSearch() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { currentRingtone, isPlaying, playRingtone, togglePlay } = usePlayer();

    // 1. Read recent searches from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setRecentSearches(parsed.slice(0, 5));
                }
            }
        } catch (e) {
            console.error('Failed to read recent searches in header:', e);
        }
    }, [isOpen]);

    // 2. Debounced search for suggestions when user types
    useEffect(() => {
        const clean = query.trim();
        if (!clean || clean.length < 2) {
            setSuggestions([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search?suggest=true&q=${encodeURIComponent(clean)}`);
                const data = await res.json();
                if (data.success && Array.isArray(data.suggestions)) {
                    setSuggestions(data.suggestions);
                    setIsOpen(true);
                }
            } catch (err) {
                console.error('Quick search error:', err);
            } finally {
                setLoading(false);
            }
        }, 200);

        return () => clearTimeout(timer);
    }, [query]);

    // 3. Handle outside clicks to close dropdown
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 4. Global keyboard shortcuts: Ctrl+K, Cmd+K, or "/"
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isTargetInput = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName);
            if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !isTargetInput)) {
                e.preventDefault();
                inputRef.current?.focus();
                setIsOpen(true);
            } else if (e.key === 'Escape') {
                setIsOpen(false);
                inputRef.current?.blur();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const executeSearch = useCallback((searchTerm: string) => {
        const clean = searchTerm.trim();
        if (!clean) return;

        // Save to recent searches
        try {
            const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
            const list: string[] = saved ? JSON.parse(saved) : [];
            const filtered = list.filter((item) => item.toLowerCase() !== clean.toLowerCase());
            const updated = [clean, ...filtered].slice(0, 8);
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
            setRecentSearches(updated.slice(0, 5));
        } catch (e) {
            console.error('Failed to save recent search:', e);
        }

        hapticFeedback(hapticPatterns.selection);
        setIsOpen(false);
        router.push(`/search?q=${encodeURIComponent(clean)}`);
    }, [router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        executeSearch(query);
    };

    const handleClear = () => {
        setQuery('');
        setSuggestions([]);
        inputRef.current?.focus();
    };

    const removeRecent = (e: React.MouseEvent, termToRemove: string) => {
        e.stopPropagation();
        setRecentSearches((prev) => {
            const updated = prev.filter((t) => t !== termToRemove);
            try {
                localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
            } catch (err) {
                console.error(err);
            }
            return updated;
        });
    };

    const ringtoneSuggestions = suggestions.filter((s) => s.type === 'ringtone');
    const movieSuggestions = suggestions.filter((s) => s.type === 'movie');
    const artistSuggestions = suggestions.filter((s) => s.type === 'artist' || s.type === 'actor');

    return (
        <div ref={containerRef} className="relative w-full max-w-sm lg:max-w-md z-50">
            {/* Input Form */}
            <form onSubmit={handleSubmit} className="relative flex items-center w-full">
                <div className="absolute left-3.5 text-m3-on-surface-variant pointer-events-none flex items-center">
                    <Search size={16} className="transition-colors group-focus-within:text-m3-primary" />
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search songs, movies, artists, actors..."
                    className="w-full h-9 pl-9.5 pr-14 rounded-full bg-m3-surface-container-high/90 hover:bg-m3-surface-container-highest border border-m3-outline-variant/30 focus:border-m3-primary/60 focus:bg-m3-surface-container-highest text-xs text-m3-on-surface placeholder:text-m3-outline/70 outline-none transition-all shadow-2xs"
                />

                <div className="absolute right-2.5 flex items-center gap-1.5">
                    {loading && (
                        <Loader2 size={14} className="animate-spin text-m3-primary" />
                    )}

                    {query && !loading && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="w-5 h-5 rounded-full flex items-center justify-center text-m3-outline hover:text-m3-on-surface hover:bg-m3-on-surface/8 transition-colors cursor-pointer"
                            aria-label="Clear search"
                        >
                            <X size={13} />
                        </button>
                    )}

                    {!query && !loading && (
                        <kbd className="hidden lg:inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded bg-m3-surface-container text-m3-outline border border-m3-outline-variant/40 select-none pointer-events-none">
                            ⌘K
                        </kbd>
                    )}
                </div>
            </form>

            {/* Suggestions & Discovery Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-m3-surface-container-high/98 backdrop-blur-xl border border-m3-outline-variant/40 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-50 divide-y divide-m3-outline-variant/20 max-h-[460px] overflow-y-auto scrollbar-thin">
                    {/* STATE A: Pre-Search State (When Query is Empty or < 2 Chars) */}
                    {query.trim().length < 2 && (
                        <div className="p-3 space-y-3">
                            {/* Recent Searches */}
                            {recentSearches.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold text-m3-outline uppercase tracking-wider mb-2 flex items-center gap-1 px-1">
                                        <Clock size={11} /> Recent Searches
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {recentSearches.map((term) => (
                                            <div
                                                key={term}
                                                onClick={() => {
                                                    setQuery(term);
                                                    executeSearch(term);
                                                }}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-m3-surface-container border border-m3-outline-variant/30 text-xs font-medium text-m3-on-surface hover:bg-m3-surface-container-highest hover:text-m3-primary transition-colors cursor-pointer group"
                                            >
                                                <Clock size={10} className="text-m3-outline" />
                                                <span>{term}</span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => removeRecent(e, term)}
                                                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-m3-outline hover:text-m3-on-surface"
                                                    aria-label="Remove recent search"
                                                >
                                                    <X size={9} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Trending Kollywood Searches */}
                            <div>
                                <p className="text-[10px] font-bold text-m3-outline uppercase tracking-wider mb-2 flex items-center gap-1 px-1">
                                    <TrendingUp size={11} className="text-m3-primary" /> Trending Now
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {QUICK_TRENDING.map((tag) => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => {
                                                setQuery(tag);
                                                executeSearch(tag);
                                            }}
                                            className="px-2.5 py-1 rounded-full bg-m3-surface-container-low hover:bg-m3-surface-container border border-m3-outline-variant/30 text-xs font-medium text-m3-on-surface-variant hover:text-m3-primary transition-colors cursor-pointer"
                                        >
                                            #{tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STATE B: Active Query with Results */}
                    {query.trim().length >= 2 && (
                        <>
                            {/* No Results Fallback */}
                            {suggestions.length === 0 && !loading && (
                                <div className="p-4 text-center">
                                    <p className="text-xs text-m3-on-surface-variant font-medium">
                                        No instant matches found for &ldquo;{query}&rdquo;
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        className="mt-2 text-xs font-bold text-m3-primary hover:underline cursor-pointer"
                                    >
                                        Search full catalog for &ldquo;{query}&rdquo; →
                                    </button>
                                </div>
                            )}

                            {/* Ringtones Section */}
                            {ringtoneSuggestions.length > 0 && (
                                <div className="p-2">
                                    <div className="px-2 py-1 text-[10px] font-bold text-m3-outline uppercase tracking-wider flex items-center gap-1">
                                        <Music size={11} /> Songs & Ringtones
                                    </div>
                                    <div className="space-y-1">
                                        {ringtoneSuggestions.map((item) => {
                                            const isCurrent = currentRingtone?.id === item.ringtone?.id;
                                            const isCurrentPlaying = isCurrent && isPlaying;
                                            const posterSrc = item.poster_url ? getImageUrl(item.poster_url, 'w92') : null;

                                            return (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center justify-between p-1.5 rounded-xl hover:bg-m3-surface-container transition-colors group"
                                                >
                                                    <Link
                                                        href={item.url}
                                                        onClick={() => setIsOpen(false)}
                                                        className="flex items-center gap-2.5 min-w-0 flex-1"
                                                    >
                                                        {/* Fixed-dimension poster thumbnail (cannot overflow) */}
                                                        <div className="relative w-9 h-9 rounded-lg bg-m3-surface-container overflow-hidden shrink-0 border border-m3-outline-variant/30 flex items-center justify-center">
                                                            {posterSrc ? (
                                                                <img
                                                                    src={posterSrc}
                                                                    alt={item.title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <Music size={14} className="text-m3-primary" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs font-bold text-m3-on-surface group-hover:text-m3-primary truncate transition-colors">
                                                                {item.title}
                                                            </p>
                                                            <p className="text-[10px] text-m3-outline truncate">
                                                                {item.subtitle}
                                                            </p>
                                                        </div>
                                                    </Link>

                                                    {/* Audio Play Preview */}
                                                    {item.ringtone && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                hapticFeedback(hapticPatterns.selection);
                                                                if (isCurrent) {
                                                                    togglePlay();
                                                                } else {
                                                                    playRingtone(item.ringtone!, 'header_search');
                                                                }
                                                            }}
                                                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ml-1.5 shrink-0 cursor-pointer ${
                                                                isCurrentPlaying
                                                                    ? 'bg-m3-primary text-m3-on-primary shadow-xs'
                                                                    : 'bg-m3-surface-container text-m3-on-surface hover:text-m3-primary hover:bg-m3-primary/10'
                                                            }`}
                                                            aria-label={isCurrentPlaying ? 'Pause ringtone' : 'Play ringtone'}
                                                        >
                                                            {isCurrentPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Movies Section */}
                            {movieSuggestions.length > 0 && (
                                <div className="p-2">
                                    <div className="px-2 py-1 text-[10px] font-bold text-m3-outline uppercase tracking-wider flex items-center gap-1">
                                        <Film size={11} /> Movies
                                    </div>
                                    <div className="space-y-1">
                                        {movieSuggestions.map((item) => {
                                            const posterSrc = item.poster_url ? getImageUrl(item.poster_url, 'w92') : null;
                                            return (
                                                <Link
                                                    key={item.id}
                                                    href={item.url}
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex items-center justify-between p-1.5 rounded-xl hover:bg-m3-surface-container transition-colors group"
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                        {/* Fixed poster thumbnail */}
                                                        <div className="relative w-7 h-10 rounded-md bg-m3-surface-container overflow-hidden shrink-0 border border-m3-outline-variant/30 flex items-center justify-center">
                                                            {posterSrc ? (
                                                                <img
                                                                    src={posterSrc}
                                                                    alt={item.title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <Film size={13} className="text-m3-outline" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs font-bold text-m3-on-surface group-hover:text-m3-primary truncate transition-colors">
                                                                {item.title}
                                                            </p>
                                                            <p className="text-[10px] text-m3-outline">{item.subtitle}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-semibold text-m3-primary bg-m3-primary/10 px-2 py-0.5 rounded-full shrink-0">
                                                        Movie
                                                    </span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Artists & Actors Section */}
                            {artistSuggestions.length > 0 && (
                                <div className="p-2">
                                    <div className="px-2 py-1 text-[10px] font-bold text-m3-outline uppercase tracking-wider flex items-center gap-1">
                                        <Mic size={11} /> Artists & Cast
                                    </div>
                                    <div className="space-y-1">
                                        {artistSuggestions.map((item) => (
                                            <Link
                                                key={item.id}
                                                href={item.url}
                                                onClick={() => setIsOpen(false)}
                                                className="flex items-center justify-between p-1.5 rounded-xl hover:bg-m3-surface-container transition-colors group"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                    <div className="w-7 h-7 rounded-full bg-linear-to-tr from-m3-primary/20 to-m3-tertiary/20 text-m3-primary text-xs font-bold flex items-center justify-center shrink-0 border border-m3-outline-variant/30">
                                                        {item.type === 'actor' ? <User size={13} /> : item.title.charAt(0)}
                                                    </div>
                                                    <p className="text-xs font-bold text-m3-on-surface group-hover:text-m3-primary truncate transition-colors">
                                                        {item.title}
                                                    </p>
                                                </div>
                                                <span className="text-[10px] font-medium text-m3-outline bg-m3-surface-container px-2 py-0.5 rounded-full shrink-0">
                                                    {item.subtitle}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Footer: See All Results with Enter shortcut */}
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="w-full p-2.5 bg-m3-surface-container/60 hover:bg-m3-surface-container flex items-center justify-between text-xs font-bold text-m3-primary transition-colors cursor-pointer"
                            >
                                <span className="flex items-center gap-1.5">
                                    <Search size={13} />
                                    See all results for &ldquo;{query}&rdquo;
                                </span>
                                <span className="flex items-center gap-1 text-[10px] text-m3-outline font-normal">
                                    Press <kbd className="font-mono font-bold px-1.5 py-0.5 rounded bg-m3-surface-container border border-m3-outline-variant/30 text-m3-on-surface">Enter ↵</kbd>
                                </span>
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
