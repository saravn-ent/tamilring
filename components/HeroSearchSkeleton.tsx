import React from 'react';

export function HeroSearchSkeleton() {
    return (
        <div className="w-full px-4 pt-6 pb-8 md:pt-10 md:pb-12 bg-white dark:bg-zinc-900 rounded-b-[2.5rem] shadow-sm mb-6 border-b border-white/50 dark:border-white/5">
            <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-4">
                <div className="h-10 w-48 rounded shimmer" />
                <div className="h-4 w-64 rounded-lg shimmer opacity-70" />
                <div className="h-14 w-full max-w-lg rounded-2xl shimmer" />
                <div className="flex justify-center gap-2">
                    <div className="h-3 w-12 rounded-full shimmer opacity-50" />
                    <div className="h-3 w-16 rounded-full shimmer opacity-50" />
                    <div className="h-3 w-14 rounded-full shimmer opacity-50" />
                </div>
            </div>
        </div>
    );
}
