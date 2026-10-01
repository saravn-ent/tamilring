'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
    Clapperboard, 
    Music2, 
    ChevronDown, 
    ChevronRight, 
    Check, 
    Film, 
    Mic, 
    PenTool, 
    User, 
    Sparkles, 
    Disc3 
} from 'lucide-react';
import TMDBImage from '@/components/TMDBImage';
import RingtoneCard from '@/components/RingtoneCard';
import { RingtoneCardSkeleton } from '@/components/skeletons';
import { 
    MovieArtist, 
    ArtistRole, 
    SuggestedMovie, 
    ArtistSuggestionsResult 
} from '@/lib/server/suggestedArtists';
import { fetchArtistSuggestions } from '@/app/actions/suggested';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';

interface MovieArtistSuggestionsProps {
    currentMovie: string;
    artists: MovieArtist[];
    initialArtist: MovieArtist;
    initialSuggestions: ArtistSuggestionsResult;
}

export default function MovieArtistSuggestions({
    currentMovie,
    artists,
    initialArtist,
    initialSuggestions,
}: MovieArtistSuggestionsProps) {
    const [selectedArtist, setSelectedArtist] = useState<MovieArtist>(initialArtist);
    const [suggestions, setSuggestions] = useState<ArtistSuggestionsResult>(initialSuggestions);
    const [isLoading, setIsLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Client-side cache so toggling back to already-viewed artists is instantaneous (0ms)
    const cacheRef = useRef<Record<string, ArtistSuggestionsResult>>({
        [`${initialArtist.role}:${initialArtist.name.toLowerCase()}`]: initialSuggestions,
    });

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Handle clicks outside the dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isDropdownOpen]);

    const handleSelectArtist = async (artist: MovieArtist) => {
        if (artist.name === selectedArtist.name && artist.role === selectedArtist.role) {
            setIsDropdownOpen(false);
            return;
        }

        hapticFeedback(hapticPatterns.tap);
        setIsDropdownOpen(false);
        setSelectedArtist(artist);

        const cacheKey = `${artist.role}:${artist.name.toLowerCase()}`;
        if (cacheRef.current[cacheKey]) {
            setSuggestions(cacheRef.current[cacheKey]);
            return;
        }

        setIsLoading(true);
        try {
            const result = await fetchArtistSuggestions(artist.name, artist.role, currentMovie);
            cacheRef.current[cacheKey] = result;
            setSuggestions(result);
        } catch (error) {
            console.error('Failed to fetch artist suggestions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Subtitle copy generator based on active role
    const getSectionSubtitle = () => {
        switch (selectedArtist.role) {
            case 'Music Director':
                return `Soundtrack collections & ringtones composed by ${selectedArtist.name}`;
            case 'Director':
                return `Movies & albums directed by ${selectedArtist.name}`;
            case 'Starring':
                return `Popular movies starring ${selectedArtist.name}`;
            case 'Singer':
                return `Ringtones & vocal cuts sung by ${selectedArtist.name}`;
            case 'Lyricist':
                return `Ringtones featuring lyrics penned by ${selectedArtist.name}`;
            default:
                return `More from ${selectedArtist.name}`;
        }
    };

    const getRoleIcon = (role: ArtistRole) => {
        switch (role) {
            case 'Music Director':
                return <Music2 size={13} className="text-amber-500 shrink-0" />;
            case 'Director':
                return <Clapperboard size={13} className="text-blue-500 shrink-0" />;
            case 'Starring':
                return <User size={13} className="text-emerald-500 shrink-0" />;
            case 'Singer':
                return <Mic size={13} className="text-rose-500 shrink-0" />;
            case 'Lyricist':
                return <PenTool size={13} className="text-purple-500 shrink-0" />;
        }
    };

    const getHeaderIcon = () => {
        if (selectedArtist.role === 'Singer' || selectedArtist.role === 'Lyricist') {
            return <Mic size={18} />;
        }
        return <Clapperboard size={18} />;
    };

    // Group artists by role for organized dropdown menu
    const groupedArtists = artists.reduce((acc, artist) => {
        if (!acc[artist.role]) acc[artist.role] = [];
        acc[artist.role].push(artist);
        return acc;
    }, {} as Record<ArtistRole, MovieArtist[]>);

    const roleOrder: ArtistRole[] = ['Music Director', 'Director', 'Starring', 'Singer', 'Lyricist'];

    return (
        <section aria-label={`More from ${selectedArtist.name}`} className="mt-10 pt-6 border-t border-m3-outline-variant/30">
            {/* Header Row */}
            <div className="flex items-end justify-between mb-4 px-1 gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                    {/* Role Icon */}
                    <div className="w-8 h-8 rounded-xl bg-m3-primary/10 text-m3-primary flex items-center justify-center shrink-0 mt-0.5">
                        {getHeaderIcon()}
                    </div>

                    <div className="min-w-0">
                        {/* Title with Interactive Artist Dropdown Trigger */}
                        <div className="relative inline-block text-left" ref={dropdownRef}>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-base sm:text-lg font-bold text-m3-on-surface tracking-tight">
                                    More from
                                </span>

                                {/* Dropdown Trigger Button */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        hapticFeedback(hapticPatterns.tap);
                                        setIsDropdownOpen(!isDropdownOpen);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-m3-surface-container-high hover:bg-m3-surface-container-highest border border-m3-outline-variant/50 text-sm font-bold text-m3-primary hover:text-m3-primary transition-all cursor-pointer shadow-2xs group active:scale-98"
                                    aria-haspopup="true"
                                    aria-expanded={isDropdownOpen}
                                    title="Switch artist"
                                >
                                    <span className="truncate max-w-[150px] sm:max-w-[240px]">
                                        {selectedArtist.name}
                                    </span>
                                    <ChevronDown
                                        size={14}
                                        className={`text-m3-outline group-hover:text-m3-primary transition-transform duration-200 shrink-0 ${
                                            isDropdownOpen ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Dropdown Popover Menu */}
                            {isDropdownOpen && (
                                <div className="absolute left-0 top-full mt-2 w-[280px] sm:w-[320px] max-h-[380px] overflow-y-auto bg-m3-surface-container-low border border-m3-outline-variant/40 rounded-2xl shadow-xl z-50 p-2 scrollbar-thin backdrop-blur-md animate-in fade-in-50 zoom-in-95">
                                    <div className="px-2.5 py-1.5 border-b border-m3-outline-variant/30 mb-1 flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-m3-on-surface-variant uppercase tracking-wider">
                                            Album Artists
                                        </span>
                                        <span className="text-[10px] text-m3-outline font-medium">
                                            {artists.length} found
                                        </span>
                                    </div>

                                    {roleOrder.map((role) => {
                                        const roleArtists = groupedArtists[role];
                                        if (!roleArtists || roleArtists.length === 0) return null;

                                        return (
                                            <div key={role} className="py-1">
                                                <div className="px-2.5 py-1 text-[10px] font-bold text-m3-outline flex items-center gap-1.5">
                                                    {getRoleIcon(role)}
                                                    <span>{role}</span>
                                                </div>

                                                <div className="space-y-0.5">
                                                    {roleArtists.map((artist) => {
                                                        const isCurrent =
                                                            artist.name === selectedArtist.name &&
                                                            artist.role === selectedArtist.role;

                                                        return (
                                                            <button
                                                                key={`${artist.role}-${artist.name}`}
                                                                type="button"
                                                                onClick={() => handleSelectArtist(artist)}
                                                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                                                                    isCurrent
                                                                        ? 'bg-m3-primary/15 text-m3-primary font-bold'
                                                                        : 'text-m3-on-surface hover:bg-m3-surface-container-high'
                                                                }`}
                                                            >
                                                                <span className="truncate pr-2">
                                                                    {artist.name}
                                                                </span>
                                                                {isCurrent && (
                                                                    <Check size={14} className="text-m3-primary shrink-0" />
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Subtitle */}
                        <p className="text-xs text-m3-on-surface-variant line-clamp-1 mt-0.5">
                            {getSectionSubtitle()}
                        </p>
                    </div>
                </div>

                {/* Right Direct Action Link */}
                <Link
                    href={`/artist/${encodeURIComponent(selectedArtist.name)}`}
                    className="inline-flex items-center gap-0.5 text-xs font-semibold text-m3-primary hover:underline shrink-0 pb-1"
                >
                    <span>
                        {suggestions.type === 'ringtones' ? 'All Tracks' : 'All Movies'}
                    </span>
                    <ChevronRight size={14} />
                </Link>
            </div>

            {/* Content Area */}
            {isLoading ? (
                // Skeletons during switch
                suggestions.type === 'ringtones' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
                        <RingtoneCardSkeleton />
                        <RingtoneCardSkeleton />
                    </div>
                ) : (
                    <div className="flex gap-2.5 sm:gap-3 overflow-x-auto px-1 pb-3 scrollbar-hide md:grid md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
                        {[1, 2, 3, 4].map((n) => (
                            <div
                                key={n}
                                className="shrink-0 w-[105px] sm:w-[120px] md:w-full aspect-[2/3] rounded-xl bg-m3-surface-container animate-pulse"
                            />
                        ))}
                    </div>
                )
            ) : suggestions.type === 'ringtones' ? (
                // Singers & Lyricists: Ringtones View
                <div>
                    {suggestions.data.length === 0 ? (
                        <div className="text-center py-8 px-4 bg-m3-surface-container-low rounded-2xl border border-m3-outline-variant/30">
                            <p className="text-xs text-m3-on-surface-variant">
                                No additional ringtones found for {selectedArtist.name}.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
                            {suggestions.data.map((ringtone) => (
                                <RingtoneCard key={ringtone.id} ringtone={ringtone} />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                // Directors, Music Directors & Actors: Movie Albums Rail
                <div>
                    {suggestions.data.length === 0 ? (
                        <div className="text-center py-8 px-4 bg-m3-surface-container-low rounded-2xl border border-m3-outline-variant/30">
                            <p className="text-xs text-m3-on-surface-variant">
                                No additional movies found for {selectedArtist.name}.
                            </p>
                        </div>
                    ) : (
                        <div className="flex gap-2.5 sm:gap-3 overflow-x-auto px-1 pb-3 scrollbar-hide snap-x md:grid md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 md:overflow-visible">
                            {suggestions.data.map((movie, idx) => (
                                <Link
                                    key={movie.movie_name}
                                    href={`/movie/${encodeURIComponent(movie.movie_name)}`}
                                    className="snap-start shrink-0 w-[105px] sm:w-[120px] md:w-full group cursor-pointer block text-left transition-all duration-300"
                                >
                                    {/* 2:3 Aspect Cinema Poster */}
                                    <div className="relative w-[105px] sm:w-[120px] md:w-full aspect-[2/3] rounded-xl sm:rounded-2xl overflow-hidden mb-1.5 bg-neutral-900 border border-m3-outline-variant/30 shadow-2xs group-hover:shadow-md group-hover:border-m3-primary/50 group-hover:-translate-y-0.5 transition-all duration-300">
                                        <TMDBImage
                                            path={movie.poster_url}
                                            alt={movie.movie_name}
                                            fallbackAlt={movie.movie_name}
                                            fill
                                            priority={idx < 4}
                                            sizes="(max-width: 640px) 105px, (max-width: 1024px) 120px, 14vw"
                                            quality={75}
                                            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                        />

                                        {/* Bottom Contrast Vignette */}
                                        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none z-10" />

                                        {/* Badges on Poster */}
                                        <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between z-20 pointer-events-none">
                                            <span className="text-[8px] font-bold text-white/90 bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-white/10">
                                                <Film size={8} className="text-rose-400" />
                                                <span>
                                                    {movie.ringtone_count}{' '}
                                                    {movie.ringtone_count === 1 ? 'Cut' : 'Cuts'}
                                                </span>
                                            </span>
                                            {movie.movie_year && (
                                                <span className="text-[8px] font-bold text-white/80 bg-black/60 backdrop-blur-xs px-1 py-0.5 rounded border border-white/10">
                                                    {movie.movie_year}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Text Metadata */}
                                    <div className="px-0.5">
                                        <h4 className="text-xs font-bold text-m3-on-surface line-clamp-1 leading-tight group-hover:text-m3-primary transition-colors tracking-tight">
                                            {movie.movie_name}
                                        </h4>
                                        <p className="text-[10px] text-m3-outline truncate mt-0.5 font-medium leading-tight">
                                            {movie.music_director || 'Tamil Cinema'}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
