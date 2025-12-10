'use client';

import { ArrowLeft, Heart } from 'lucide-react';
import Link from 'next/link';
import ImageWithFallback from './ImageWithFallback';
import { formatCount } from '@/lib/utils';
import FavoriteButton from './FavoriteButton';
import ShareButton from './ShareButton';
import ArtistImageUpload from './ArtistImageUpload';

// ...

interface CompactProfileHeaderProps {
    name: string;
    type: 'Actor' | 'Singer' | 'Music Director' | 'Movie Director';
    ringtoneCount: number;
    movieCount?: number;
    totalLikes: number;
    imageUrl?: string | null;
    bio?: string;
    shareMetadata?: { title: string; text: string };
}

// ... props ...
export default function CompactProfileHeader({
    name,
    type,
    ringtoneCount,
    movieCount,
    totalLikes,
    imageUrl,
    bio,
    shareMetadata
}: CompactProfileHeaderProps) {
    return (
        <div className="sticky top-0 z-40 bg-neutral-900/95 backdrop-blur-md border-b border-white/10 shadow-lg">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                <Link
                    href="/"
                    className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em]">{type}</span>
                </div>
                <div className="flex items-center gap-2">
                    <FavoriteButton
                        item={{
                            id: name,
                            name,
                            type,
                            imageUrl: imageUrl || undefined,
                            href: type === 'Actor' ? `/actor/${encodeURIComponent(name)}` : `/artist/${encodeURIComponent(name)}`
                        }}
                        className="w-8 h-8 bg-neutral-800 hover:bg-neutral-700 text-zinc-400 hover:text-red-500"
                    />
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 py-4">
                <div className="flex items-start gap-4">
                    {/* Square-ish Avatar with rounded corners - Larger/Premium */}
                    {/* Portrait Avatar - Matches Homepage HeroCard Style */}
                    {/* Portrait Avatar - Matches Homepage HeroCard Style */}
                    <div className="relative shrink-0 group">
                        <div className={`
                            relative w-28 h-40 rounded-xl border-2 shadow-2xl overflow-hidden bg-neutral-800
                            ${type === 'Music Director' || type === 'Movie Director' ? 'border-amber-500/30 shadow-amber-500/10' : 'border-white/10'}
                        `}>
                            <ImageWithFallback
                                src={imageUrl || undefined}
                                alt={name}
                                className="object-cover object-top"
                                fallbackClassName="bg-neutral-800 text-zinc-600 flex items-center justify-center p-4"
                            />
                        </div>
                        {/* Admin Upload Control */}
                        <ArtistImageUpload artistName={name} currentImage={imageUrl || undefined} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <h1 className="text-2xl font-bold text-white leading-tight tracking-tight">{name}</h1>
                            {shareMetadata && (
                                <ShareButton
                                    variant="icon"
                                    title={shareMetadata.title}
                                    text={shareMetadata.text}
                                    className="shrink-0 w-8 h-8 !p-0 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white"
                                />
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
                            {movieCount !== undefined && movieCount > 0 && (
                                <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-md text-zinc-200 border border-white/10 font-medium">
                                    <span className={type === 'Music Director' ? 'text-amber-500' : 'text-zinc-400'}>{movieCount} Movies</span>
                                </span>
                            )}
                            <span className="bg-white/5 px-2.5 py-1 rounded-md text-zinc-300 border border-white/10">
                                {ringtoneCount} Ringtones
                            </span>
                            <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-md text-zinc-300 border border-white/10">
                                <Heart size={10} className="fill-zinc-300 text-zinc-300" />
                                {formatCount(totalLikes)} Likes
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bio - Collapsible/Compact */}
                {bio && (
                    <div className="mt-4 pt-3 border-t border-white/5">
                        <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed">
                            {bio}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
