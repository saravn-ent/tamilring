'use client';

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

interface ArtistAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
}

export default function ArtistAutocomplete({ value, onChange, placeholder = "Search artists...", label }: ArtistAutocompleteProps) {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close suggestions when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch suggestions
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (value.length < 2) {
                setSuggestions([]);
                return;
            }

            setIsLoading(true);
            try {
                const res = await fetch(`/api/artists/search?q=${encodeURIComponent(value)}`);
                const data = await res.json();
                setSuggestions(data);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Failed to fetch artist suggestions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const debounce = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounce);
    }, [value]);

    const handleSelect = (artist: string) => {
        onChange(artist);
        setShowSuggestions(false);
    };

    return (
        <div ref={wrapperRef} className="relative">
            {label && (
                <label className="block text-sm font-bold text-zinc-300 mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => value.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-neutral-800 border border-neutral-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                    {suggestions.map((artist, index) => (
                        <button
                            key={index}
                            onClick={() => handleSelect(artist)}
                            className="w-full px-4 py-3 text-left text-white hover:bg-neutral-700 transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                            {artist}
                        </button>
                    ))}
                </div>
            )}

            {/* Loading indicator */}
            {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Helper text */}
            {value.length > 0 && suggestions.length === 0 && !isLoading && (
                <p className="text-xs text-zinc-500 mt-2">
                    No existing artists found. Your entry will create a new artist profile.
                </p>
            )}
        </div>
    );
}
