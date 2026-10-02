'use client';

import React from 'react';
import { Search, PlusCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface NoResultsProps {
    query: string;
    onClear?: () => void;
}

export default function NoResults({ query, onClear }: NoResultsProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto space-y-5 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-m3-surface-container-high border border-m3-outline-variant/30 flex items-center justify-center text-m3-outline">
                <Search size={28} />
            </div>

            <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-m3-on-surface">No matches found</h3>
                <p className="text-sm text-m3-on-surface-variant leading-relaxed">
                    We couldn&apos;t find any songs, movies, or artists matching{' '}
                    <span className="text-m3-primary font-semibold">&ldquo;{query}&rdquo;</span>.
                </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/30 text-left text-xs text-m3-on-surface-variant space-y-1.5 w-full">
                <p className="font-semibold text-m3-on-surface flex items-center gap-1.5">
                    <Sparkles size={13} className="text-m3-primary" /> Search tips:
                </p>
                <ul className="list-disc list-inside space-y-1 text-m3-outline text-[11px] leading-relaxed">
                    <li>Check for spelling errors or try alternative transliterations</li>
                    <li>Try searching just the movie title (e.g. &ldquo;Mankatha&rdquo; instead of &ldquo;Mankatha theme bgm&rdquo;)</li>
                    <li>Search by composer or singer name (e.g. &ldquo;Anirudh&rdquo; or &ldquo;SPB&rdquo;)</li>
                </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1 w-full justify-center">
                {onClear && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="w-full sm:w-auto px-4 py-2 rounded-full border border-m3-outline-variant/40 text-xs font-semibold text-m3-on-surface hover:bg-m3-surface-container transition-colors cursor-pointer"
                    >
                        Clear Search
                    </button>
                )}
                <Link
                    href={`/requests?song=${encodeURIComponent(query)}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-m3-primary text-m3-on-primary text-xs font-bold hover:shadow-md active:scale-95 transition-all"
                >
                    <PlusCircle size={14} />
                    <span>Request This Ringtone</span>
                </Link>
            </div>
        </div>
    );
}
