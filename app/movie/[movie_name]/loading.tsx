import React from 'react';
import { RingtoneGridSkeleton } from '@/components/skeletons';

export default function MovieLoading() {
    return (
        <div className="max-w-md mx-auto animate-pulse">
            {/* Hero Image Skeleton */}
            <div className="relative h-64 w-full bg-zinc-200" />

            <div className="px-4 py-6">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between mb-6">
                    <div className="h-6 w-32 bg-zinc-100 rounded-lg" />
                    <div className="h-9 w-24 bg-zinc-100 rounded-lg" />
                </div>
                {/* List Skeleton */}
                <RingtoneGridSkeleton count={5} />
            </div>
        </div>
    );
}
