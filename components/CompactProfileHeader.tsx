'use client';

import { ArrowLeft, Heart } from 'lucide-react';
import Link from 'next/link';
import ImageWithFallback from './ImageWithFallback';
import { formatCount } from '@/lib/utils';

interface CompactProfileHeaderProps {
    name: string;
    type: 'Actor' | 'Singer' | 'Music Director';
    ringtoneCount: number;
    totalLikes: number;
    imageUrl?: string;
    bio?: string;
}

export default function CompactProfileHeader({
    name,
    type,
    ringtoneCount,
    totalLikes,
    imageUrl,
    bio
}: CompactProfileHeaderProps) {
    return (
        <div className="sticky top-0 z-40 bg-neutral-900/95 backdrop-blur-md border-b border-white/10 shadow-lg">
            {/* Back Button - Absolute positioned */}
            <Link
                href="/"
                className="absolute top-3 left-3 z-50 p-2 bg-black/40 backdrop-blur-md rounded-full text-zinc-100 hover:bg-black/60 transition-colors"
            >
                <ArrowLeft size={18} />
            </Link>

            <div className="max-w-md mx-auto px-4 py-3">
                <div className="flex items-center gap-3">
                    {/* Compact Avatar */}
                    <div className="relative w-14 h-14 rounded-full border-2 border-white/10 shadow-lg overflow-hidden shrink-0">
                        <ImageWithFallback
                            src={imageUrl}
                            alt={name}
                            className="object-cover"
                            fallbackClassName="bg-neutral-800 text-zinc-500"
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-bold text-white truncate">{name}</h1>
                        <div className="flex items-center gap-3 text-xs text-zinc-400">
                            <span>{type} • {ringtoneCount} Ringtones</span>
                            <span className="flex items-center gap-1 text-zinc-300 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                <Heart size={10} className="fill-zinc-300" />
                                {formatCount(totalLikes)} Likes
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bio - Collapsible/Compact */}
                {bio && (
                    <div className="mt-2 pt-2 border-t border-white/5">
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                            {bio}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
