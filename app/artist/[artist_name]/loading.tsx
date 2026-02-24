import React from 'react';
import { RingtoneGridSkeleton } from '@/components/skeletons';

export default function ArtistLoading() {
    return (
        <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto pb-24 animate-pulse">
            {/* Header Skeleton */}
            <div className="bg-white border-b border-zinc-200">
                <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-100/50">
                    <div className="w-8 h-8 bg-zinc-100 rounded-full" />
                    <div className="flex flex-col items-center gap-1">
                        <div className="w-16 h-2 bg-zinc-100 rounded" />
                        <div className="w-10 h-2 bg-zinc-100 rounded" />
                    </div>
                    <div className="w-8 h-8 bg-zinc-100 rounded-full" />
                </div>
                <div className="px-5 py-4">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-full bg-zinc-100" />
                        <div className="flex-1 space-y-2">
                            <div className="h-6 w-1/3 bg-zinc-100 rounded" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls Skeleton */}
            <div className="sticky top-0 z-40 bg-white px-4 py-3 border-b border-zinc-100 flex justify-between items-center">
                <div className="h-8 w-24 bg-zinc-100 rounded-lg" />
                <div className="h-8 w-24 bg-zinc-100 rounded-lg" />
            </div>

            {/* List Skeleton */}
            <div className="px-4 py-6">
                <RingtoneGridSkeleton count={6} />
            </div>
        </div>
    );
}
