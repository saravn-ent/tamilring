import React from 'react';

export function SectionHeaderSkeleton() {
    return (
        <div className="flex items-center justify-between mb-4 px-4">
            <div className="h-6 w-48 bg-zinc-200 rounded animate-pulse" />
            <div className="h-4 w-16 bg-zinc-200 rounded animate-pulse" />
        </div>
    );
}

export function HeroCardSkeleton() {
    return (
        <div className="snap-start shrink-0 flex flex-col items-center gap-3 w-28 md:w-32">
            <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-zinc-200 animate-pulse" />
            <div className="space-y-2 w-full flex flex-col items-center">
                <div className="h-3 w-20 bg-zinc-200 rounded animate-pulse" />
                <div className="h-2 w-12 bg-zinc-200 rounded animate-pulse" />
            </div>
        </div>
    );
}

export function RingtoneCardSkeleton() {
    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-zinc-100 h-full">
            {/* Image Skeleton */}
            <div className="aspect-[2/3] w-full bg-zinc-200 animate-pulse relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            </div>

            {/* Content Skeleton */}
            <div className="p-3 space-y-2">
                <div className="h-4 w-3/4 bg-zinc-200 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-zinc-200 rounded animate-pulse" />
                <div className="flex justify-between items-center mt-2">
                    <div className="h-3 w-10 bg-zinc-200 rounded animate-pulse" />
                    <div className="h-6 w-6 rounded-full bg-zinc-200 animate-pulse" />
                </div>
            </div>
        </div>
    );
}

export function RingtoneGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <RingtoneCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function HorizontalListSkeleton() {
    return (
        <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="snap-start shrink-0 w-32 sm:w-36 md:w-40">
                    <div className="w-32 sm:w-36 md:w-40 h-44 sm:h-48 md:h-56 rounded-xl bg-zinc-200 animate-pulse mb-2" />
                    <div className="h-3 w-24 bg-zinc-200 rounded animate-pulse mb-1" />
                    <div className="h-2 w-16 bg-zinc-200 rounded animate-pulse" />
                </div>
            ))}
        </div>
    )
}


export function SectionSkeleton() {
    return (
        <div className="mb-10">
            <SectionHeaderSkeleton />
            <HorizontalListSkeleton />
        </div>
    );
}
