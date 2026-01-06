'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, Sparkles, Clock, Music, Flame, Heart, Zap, Frown, Smile, Mic2, Disc, Guitar, Wind } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import { splitArtists } from '@/lib/utils';
import { Ringtone } from '@/types';
import RingtoneCard from '@/components/RingtoneCard';
import ImageWithFallback from '@/components/ImageWithFallback';
import NoResults from '@/components/NoResults';
import { ERAS, MOODS as MOOD_STRINGS } from '@/lib/constants';

interface FeaturedArtist {
    name: string;
    type: string;
    image: string;
}

interface DiscoveryContainerProps {
    featuredArtists: FeaturedArtist[];
}

// Moods with Icons (from categories page)
const RICH_MOODS = [
    { name: "Love", icon: Heart, color: "text-rose-400" },
    { name: "Mass", icon: Zap, color: "text-amber-400" },
    { name: "Sad", icon: Frown, color: "text-blue-400" },
    { name: "BGM", icon: Music, color: "text-emerald-400" },
    { name: "Funny", icon: Smile, color: "text-orange-400" },
    { name: "Melody", icon: Mic2, color: "text-purple-400" },
];

const INSTRUMENTS = [
    { label: "Flute", icon: Wind, query: "flute" },
    { label: "Violin", icon: Music, query: "violin" },
    { label: "Guitar", icon: Guitar, query: "guitar" },
    { label: "Piano", icon: Disc, query: "piano" }
];

export default function DiscoveryContainer({ featuredArtists }: DiscoveryContainerProps) {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'ringtones' | 'movies' | 'artists'>('all');

    // Results State
    const [results, setResults] = useState<{
        ringtones: Ringtone[];
        movies: any[];
        artists: any[];
    }>({ ringtones: [], movies: [], artists: [] });

    // Live Search Effect
    useEffect(() => {
        // Reset results if query is empty or too short
        if (query.length <= 1) {
            setResults({ ringtones: [], movies: [], artists: [] });
            setLoading(false);
            return;
        }

        setLoading(true);
        const delayDebounceFn = setTimeout(async () => {
            let newResults = { ringtones: [], movies: [], artists: [] };
            const matchedEra = ERAS.find(e => e.label.toLowerCase() === query.toLowerCase());

            const fetchRingtones = async () => {
                let dbQuery = supabase.from('ringtones').select('*').eq('status', 'approved');
                if (matchedEra) {
                    dbQuery = dbQuery.gte('movie_year', matchedEra.startYear).lte('movie_year', matchedEra.endYear).order('downloads', { ascending: false }).limit(20);
                } else {
                    dbQuery = dbQuery.ilike('title', `%${query}%`).limit(10);
                }
                const { data } = await dbQuery;
                return data || [];
            };

            const fetchMovies = async () => {
                let dbQuery = supabase.from('ringtones').select('movie_name, movie_year, poster_url').eq('status', 'approved');
                if (matchedEra) {
                    dbQuery = dbQuery.gte('movie_year', matchedEra.startYear).lte('movie_year', matchedEra.endYear).limit(50);
                } else {
                    dbQuery = dbQuery.ilike('movie_name', `%${query}%`).limit(20);
                }
                const { data } = await dbQuery;
                const uniqueMovies = new Map();
                data?.forEach(item => { if (!uniqueMovies.has(item.movie_name)) uniqueMovies.set(item.movie_name, item); });
                return Array.from(uniqueMovies.values());
            };

            const fetchArtists = async () => {
                if (matchedEra) return []; // Skip artists for eras
                const { data } = await supabase.from('ringtones').select('singers, music_director').eq('status', 'approved').or(`singers.ilike.%${query}%,music_director.ilike.%${query}%`).limit(20);
                const allArtists = new Set<string>();
                data?.forEach(r => {
                    splitArtists(r.singers || '').forEach(s => allArtists.add(s));
                    splitArtists(r.music_director || '').forEach(s => allArtists.add(s));
                });
                return Array.from(allArtists).filter(s => s.toLowerCase().includes(query.toLowerCase())).map(s => ({ name: s })).slice(0, 10);
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
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query, activeTab]);

    const hasResults = results.ringtones.length > 0 || results.movies.length > 0 || results.artists.length > 0;

    return (
        <div className="max-w-md mx-auto p-4 pb-24 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">Discover</h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Find your perfect ringtone</p>
            </div>

            {/* Search Input */}
            {/* Search Input Container */}
            <div className="relative mb-6 sticky top-0 z-30 pt-2 bg-background/90 pb-2 backdrop-blur-xl -mx-4 px-4 transition-colors duration-300">
                <div className="relative w-full">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Find rings, artists, or bgm..."
                        className="w-full bg-zinc-100 dark:bg-neutral-800/80 border border-zinc-200 dark:border-neutral-700 rounded-xl px-12 py-4 text-lg text-foreground focus:outline-none focus:border-emerald-500 transition-all shadow-lg focus:shadow-emerald-500/10"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                    {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-spin" />}
                </div>

                {/* Tabs - Only visible when searching */}
                {query.length > 0 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide animate-in slide-in-from-top-2">
                        {['all', 'ringtones', 'movies', 'artists'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-4 py-2 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-colors border ${activeTab === tab
                                    ? 'bg-emerald-500 text-white dark:text-neutral-900 border-emerald-500'
                                    : 'bg-zinc-100 dark:bg-neutral-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-neutral-700 hover:border-emerald-500/50'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* CONTENT AREA */}
            {query.length > 0 ? (
                /* SEARCH RESULTS */
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {!loading && !hasResults ? (
                        <NoResults query={query} />
                    ) : (
                        <>
                            {/* Movies Section */}
                            {(activeTab === 'all' || activeTab === 'movies') && results.movies.length > 0 && (
                                <section>
                                    <h3 className="font-bold text-zinc-500 text-xs uppercase tracking-wider mb-3 px-1">Matching Movies</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {results.movies.map((item, idx) => (
                                            <Link href={`/movie/${encodeURIComponent(item.movie_name)}`} key={idx} className="flex flex-col gap-2 p-2 bg-white dark:bg-neutral-900 rounded-xl border border-zinc-100 dark:border-neutral-800 hover:border-emerald-500/50 transition-colors group">
                                                <div className="relative w-full aspect-[2/3] bg-zinc-100 dark:bg-neutral-800 rounded-lg overflow-hidden shrink-0">
                                                    {item.poster_url ? <Image src={item.poster_url} alt={item.movie_name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" /> : null}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground text-sm truncate">{item.movie_name}</p>
                                                    <p className="text-[10px] text-zinc-500">{item.movie_year}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Artists Section */}
                            {(activeTab === 'all' || activeTab === 'artists') && results.artists.length > 0 && (
                                <section>
                                    <h3 className="font-bold text-zinc-500 text-xs uppercase tracking-wider mb-3 px-1">Artists</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {results.artists.map((item, idx) => (
                                            <Link href={`/artist/${encodeURIComponent(item.name)}`} key={idx} className="flex items-center gap-3 pr-4 pl-2 py-2 bg-white dark:bg-neutral-900 rounded-full border border-zinc-100 dark:border-neutral-800 hover:border-emerald-500/50 transition-colors">
                                                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-neutral-800 flex items-center justify-center text-emerald-600 dark:text-emerald-500 font-bold border border-zinc-200 dark:border-neutral-700">
                                                    {item.name.charAt(0)}
                                                </div>
                                                <p className="font-medium text-foreground text-sm">{item.name}</p>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Ringtones Section */}
                            {(activeTab === 'all' || activeTab === 'ringtones') && results.ringtones.length > 0 && (
                                <section>
                                    <h3 className="font-bold text-zinc-500 text-xs uppercase tracking-wider mb-3 px-1">Ringtones</h3>
                                    <div className="space-y-3">
                                        {results.ringtones.map((item) => (
                                            <RingtoneCard key={item.id} ringtone={item} />
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
                    )}
                </div>
            ) : (
                /* DEFAULT DISCOVERY VIEW */
                <div className="space-y-8 animate-in fade-in duration-500">

                    {/* By Mood */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles size={16} className="text-emerald-500" />
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">By Mood</h2>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
                            {RICH_MOODS.map((mood) => (
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
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Clock size={16} className="text-emerald-500" />
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">By Era</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {ERAS.map((era) => (
                                <button
                                    key={era.label}
                                    onClick={() => setQuery(era.label)} // Use button to trigger search in current view
                                    className={`relative h-24 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br ${era.color} border border-zinc-200 dark:border-white/5 hover:scale-[1.02] transition-transform group shadow-md cursor-pointer`}
                                >
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                    <span className="relative text-xl font-black italic text-white tracking-wider drop-shadow-lg opacity-90">{era.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Instruments */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Music size={16} className="text-emerald-500" />
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Instruments</h2>
                        </div>
                        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                            {INSTRUMENTS.map((inst) => (
                                <button
                                    key={inst.label}
                                    onClick={() => setQuery(inst.query)}
                                    className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-800/30 border border-zinc-200 dark:border-white/5 hover:bg-zinc-100 dark:hover:bg-neutral-800 hover:border-emerald-500/30 transition-all"
                                >
                                    <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-neutral-700/50 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                                        <inst.icon size={18} />
                                    </div>
                                    <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{inst.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Featured Artists */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Flame size={16} className="text-emerald-500" />
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Featured Artists</h2>
                        </div>
                        <div className="flex flex-wrap justify-center gap-6 py-4">
                            {featuredArtists.map((artist, idx) => {
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
                                            <div className="absolute top-2 left-4 w-4 h-2 bg-white/40 dark:bg-white/20 rounded-full blur-[1px] rotate-[-45deg] z-10" />
                                        </div>
                                        <span className="mt-3 text-xs font-bold text-zinc-700 dark:text-zinc-300 text-center line-clamp-1 w-full px-1 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">{artist.name}</span>
                                    </Link>
                                )
                            })}
                        </div>
                    </section>

                </div>
            )}
        </div>
    );
}
