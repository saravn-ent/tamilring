import React from 'react';

export function SectionHeaderSkeleton() {
    return (
        <div className="flex items-center justify-between mb-4 px-4">
            <div className="h-6 w-48 rounded shimmer" />
            <div className="h-4 w-16 rounded shimmer" />
        </div>
    );
}

export function HeroCardSkeleton() {
    return (
        <div className="snap-start shrink-0 flex flex-col items-center gap-3 w-28 md:w-32">
            <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full shimmer" />
            <div className="space-y-2 w-full flex flex-col items-center">
                <div className="h-3 w-20 rounded shimmer" />
                <div className="h-2 w-12 rounded shimmer" />
            </div>
        </div>
    );
}

export function RingtoneCardSkeleton() {
    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl p-3 sm:p-4 h-[100px] flex items-center gap-3">
            {/* Left Image Section */}
            <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl shimmer" />
                <div className="h-2 w-8 rounded shimmer opacity-50" />
            </div>

            {/* Middle Content Section */}
            <div className="flex-1 min-w-0 space-y-2">
                <div className="h-4 w-3/4 rounded shimmer" />
                <div className="h-3 w-1/2 rounded shimmer opacity-70" />
                <div className="h-3 w-1/3 rounded shimmer opacity-40" />
            </div>

            {/* Right Actions Section */}
            <div className="flex flex-col gap-1 shrink-0">
                <div className="w-8 h-8 rounded-full shimmer" />
                <div className="w-8 h-8 rounded-full shimmer" />
            </div>
        </div>
    );
}

export function RingtoneGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <RingtoneCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function HorizontalListSkeleton() {
    return (
        <div className="flex gap-4 overflow-x-auto px-4 pb-8 scrollbar-hide snap-x pt-2 pl-6">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="snap-start shrink-0 w-32 h-48 rounded-xl shimmer" />
            ))}
        </div>
    )
}

export function TrendingSkeleton() {
    return (
        <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="snap-start shrink-0 w-32 sm:w-36 md:w-40 space-y-2">
                    <div className="w-32 sm:w-36 md:w-40 h-44 sm:h-48 md:h-56 rounded-xl shimmer" />
                    <div className="h-3 w-3/4 rounded shimmer opacity-70" />
                    <div className="h-2 w-1/2 rounded shimmer opacity-40" />
                </div>
            ))}
        </div>
    );
}

export function ContributorSkeleton() {
    return (
        <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x pt-2">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="snap-start shrink-0 flex flex-col items-center gap-3 w-24">
                    <div className="w-16 h-16 rounded-full shimmer" />
                    <div className="space-y-1 w-full flex flex-col items-center">
                        <div className="h-2 w-10 rounded shimmer opacity-50" />
                        <div className="h-3 w-16 rounded shimmer" />
                        <div className="h-2 w-12 rounded shimmer opacity-30" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function SectionSkeleton({ type = 'horizontal' }: { type?: 'horizontal' | 'grid' | 'trending' | 'contributors' }) {
    return (
        <div className="mb-10">
            <SectionHeaderSkeleton />
            {type === 'horizontal' && <HorizontalListSkeleton />}
            {type === 'trending' && <TrendingSkeleton />}
            {type === 'grid' && <RingtoneGridSkeleton count={3} />}
            {type === 'contributors' && <ContributorSkeleton />}
        </div>
    );
}

export function HeroSkeleton() {
    return (
        <div className="w-full px-4 pt-6 pb-8 md:pt-10 md:pb-12 bg-white rounded-b-[2.5rem] shadow-sm mb-6 border-b border-white/50">
            <div className="max-w-2xl mx-auto text-center space-y-4">
                {/* Headline Skeleton */}
                <div className="h-10 md:h-12 w-3/4 mx-auto rounded-lg shimmer" />
                
                {/* Subtitle Skeleton */}
                <div className="h-4 w-1/2 mx-auto rounded shimmer opacity-60" />

                {/* Search Bar Skeleton */}
                <div className="max-w-lg mx-auto w-full h-14 rounded-2xl shimmer mt-4" />

                {/* Trending Tags Skeleton */}
                <div className="flex justify-center gap-2 mt-4">
                    <div className="h-4 w-12 rounded shimmer opacity-40" />
                    <div className="h-4 w-16 rounded shimmer opacity-30" />
                    <div className="h-4 w-20 rounded shimmer opacity-30" />
                    <div className="h-4 w-14 rounded shimmer opacity-30" />
                </div>
            </div>
        </div>
    );
}
