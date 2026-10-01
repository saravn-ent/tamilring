'use client';

import dynamic from 'next/dynamic';
import { M3Chip } from '@/components/ui/m3';

const DiscoverySearch = dynamic(() => import('./DiscoverySearch'), {
    loading: () => <div className="h-14 w-full bg-m3-surface-container-high rounded-full animate-pulse m3-elevation-1" />,
    ssr: true
});

interface Props {
    trendingTags?: string[];
}

export default function HeroSearch({ trendingTags = [] }: Props) {
    return (
        <div className="w-full px-1 pt-2 pb-1 mb-2">
            <div className="max-w-4xl mx-auto space-y-2.5">
                {/* 56dp Authentic Search Bar */}
                <div className="w-full">
                    <DiscoverySearch className="mb-0" />
                </div>

                {/* Trending Tags Chips (Horizontal Rail) */}
                {trendingTags && trendingTags.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 scrollbar-hide flex-nowrap justify-start sm:justify-center">
                        {trendingTags.slice(0, 8).map((tag) => (
                            <M3Chip
                                key={tag}
                                variant="suggestion"
                                href={`/search?q=${encodeURIComponent(tag)}`}
                                label={`#${tag}`}
                                className="h-7 text-[11px] font-medium border-m3-outline-variant/30 text-m3-on-surface-variant hover:text-m3-primary hover:border-m3-primary/40 shrink-0"
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

