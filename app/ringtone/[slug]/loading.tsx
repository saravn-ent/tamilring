import React from 'react';
import { RingtoneGridSkeleton } from '@/components/skeletons';

export default function RingtoneLoading() {
    return (
        <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto min-h-screen relative flex flex-col animate-pulse">
            {/* Backdrop Skeleton */}
            <div className="h-96 bg-m3-surface-container" />

            <div className="relative z-10 p-4 -mt-32 flex-1 pb-24">
                <div className="flex items-center justify-between mb-8">
                    <div className="w-10 h-10 bg-m3-surface-container-high rounded-full" />
                </div>

                <div className="flex flex-col items-center text-center space-y-6">
                    {/* Poster Skeleton */}
                    <div className="w-32 h-48 rounded-xl bg-m3-surface-container-high shadow-xl" />

                    {/* Title & Artist Skeleton */}
                    <div className="space-y-3 w-full max-w-xs">
                        <div className="h-8 bg-m3-surface-container-high rounded-lg w-3/4 mx-auto" />
                        <div className="h-4 bg-m3-surface-container rounded w-1/2 mx-auto" />
                        <div className="h-4 bg-m3-surface-container rounded w-2/3 mx-auto" />
                    </div>

                    {/* Buttons Skeleton */}
                    <div className="flex gap-3 w-full max-w-sm">
                        <div className="h-12 bg-m3-surface-container-high rounded-xl flex-1" />
                        <div className="h-12 bg-m3-surface-container-high rounded-xl flex-1" />
                    </div>

                    {/* Similar Section Skeleton */}
                    <div className="w-full pt-12">
                        <div className="h-6 bg-m3-surface-container-high rounded w-32 mb-6" />
                        <RingtoneGridSkeleton count={4} />
                    </div>
                </div>
            </div>
        </div>
    );
}
