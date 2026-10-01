import React from 'react';
import { RingtoneGridSkeleton } from '@/components/skeletons';

export default function MovieLoading() {
    return (
        <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto pb-24 px-3 sm:px-6 pt-2 sm:pt-4">
            {/* Hero Card Skeleton - Compact Side-by-Side */}
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-4 bg-m3-surface-container-low border border-m3-outline-variant/30 p-3 sm:p-5 flex flex-col gap-2.5">
                {/* Top Nav Row Skeleton */}
                <div className="flex items-center justify-between">
                    <div className="h-7.5 w-16 rounded-full bg-m3-surface-container-high shimmer" />
                    <div className="flex items-center gap-1.5">
                        <div className="h-8 w-8 rounded-full bg-m3-surface-container-high shimmer" />
                        <div className="h-8 w-8 rounded-full bg-m3-surface-container-high shimmer" />
                    </div>
                </div>

                {/* Main Content Skeleton - Side by Side */}
                <div className="flex items-center sm:items-end gap-3 sm:gap-5">
                    {/* Poster box */}
                    <div className="w-20 h-28 sm:w-28 sm:h-40 md:w-32 md:h-46 rounded-xl sm:rounded-2xl bg-m3-surface-container-high shrink-0 shimmer" />

                    {/* Titles and badges */}
                    <div className="flex-1 space-y-2">
                        <div className="flex gap-1.5">
                            <div className="h-4 w-18 rounded-md bg-m3-surface-container-high shimmer" />
                            <div className="h-4 w-12 rounded-md bg-m3-surface-container-high shimmer" />
                        </div>
                        <div className="h-6 sm:h-8 w-44 sm:w-60 rounded-lg bg-m3-surface-container-high shimmer" />
                        <div className="h-3.5 w-32 rounded-md bg-m3-surface-container-high shimmer" />
                        <div className="h-8 w-32 rounded-full bg-m3-surface-container-high shimmer pt-1" />
                    </div>
                </div>
            </div>

            {/* Filter / Sort bar skeleton */}
            <div className="h-10 w-full rounded-xl bg-m3-surface-container-low border border-m3-outline-variant/30 mb-4 flex items-center justify-between px-3 sm:px-4">
                <div className="h-4 w-24 rounded-md bg-m3-surface-container-high shimmer" />
                <div className="h-7 w-28 rounded-full bg-m3-surface-container-high shimmer" />
            </div>

            {/* Grid Skeleton */}
            <RingtoneGridSkeleton count={6} />
        </div>
    );
}
