
import React from 'react';

export default function Loading() {
    return (
        <div className="max-w-md mx-auto min-h-screen bg-neutral-900 px-4 pt-20 pb-32 space-y-8 animate-pulse">
            {/* Search Bar Skeleton */}
            <div className="h-14 bg-neutral-800 rounded-xl w-full border border-neutral-700/50" />

            {/* Hero Slider Skeleton */}
            <div className="space-y-4">
                <div className="h-4 w-32 bg-neutral-800 rounded ml-1" />
                <div className="aspect-video w-full bg-neutral-800 rounded-2xl border border-neutral-700/50" />
            </div>

            {/* Categories Skeleton */}
            <div className="space-y-4">
                <div className="h-4 w-28 bg-neutral-800 rounded ml-1" />
                <div className="flex gap-3 overflow-hidden">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-20 w-32 shrink-0 bg-neutral-800 rounded-xl border border-neutral-700/50" />
                    ))}
                </div>
            </div>

            {/* List Skeleton */}
            <div className="space-y-4">
                <div className="h-4 w-24 bg-neutral-800 rounded ml-1" />
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-20 bg-neutral-800 rounded-xl border border-neutral-700/50" />
                    ))}
                </div>
            </div>
        </div>
    );
}
