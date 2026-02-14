import React from 'react';

export function HeroSearchSkeleton() {
    return (
        <div className="w-full px-4 pt-6 pb-8 md:pt-10 md:pb-12 bg-white rounded-b-[2.5rem] shadow-sm mb-6 border-b border-white/50 animate-pulse">
            <div className="max-w-2xl mx-auto text-center flex flex-col items-center">
                <div className="h-10 w-48 bg-zinc-200 rounded mb-4" />
                <div className="h-4 w-64 bg-zinc-100 rounded mb-6" />
                <div className="h-14 w-full max-w-lg bg-zinc-100 rounded-2xl mb-4" />
                <div className="flex justify-center gap-2">
                    <div className="h-3 w-12 bg-zinc-100 rounded" />
                    <div className="h-3 w-16 bg-zinc-100 rounded" />
                    <div className="h-3 w-14 bg-zinc-100 rounded" />
                </div>
            </div>
        </div>
    );
}
