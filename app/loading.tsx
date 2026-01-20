
import React from 'react';

export default function Loading() {
    return (
        <div className="max-w-md mx-auto min-h-screen bg-white px-4 pt-20 pb-32 space-y-8 animate-pulse">
            {/* Search Bar Skeleton */}
            <div className="h-14 bg-brand-wash rounded-xl w-full border border-brand-border/50" />

            {/* Hero Slider Skeleton */}
            <div className="space-y-4">
                <div className="h-4 w-32 bg-brand-wash rounded ml-1" />
                <div className="aspect-video w-full bg-brand-wash rounded-2xl border border-brand-border/50" />
            </div>

            {/* Categories Skeleton */}
            <div className="space-y-4">
                <div className="h-4 w-28 bg-brand-wash rounded ml-1" />
                <div className="flex gap-3 overflow-hidden">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-20 w-32 shrink-0 bg-brand-wash rounded-xl border border-brand-border/50" />
                    ))}
                </div>
            </div>

            {/* List Skeleton */}
            <div className="space-y-4">
                <div className="h-4 w-24 bg-brand-wash rounded ml-1" />
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-20 bg-brand-wash rounded-xl border border-brand-border/50" />
                    ))}
                </div>
            </div>
        </div>
    );
}
