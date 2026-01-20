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
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-gray/50 shadow-sm transition-all duration-300">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-brand-gray/50">
                <Link
                    href="/"
                    className="p-2 -ml-2 text-zinc-400 hover:text-brand-dark transition-colors"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-brand-accent uppercase tracking-[0.2em]">{type}</span>
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
                        className="w-8 h-8 bg-brand-wash hover:bg-white text-zinc-400 hover:text-red-500 border border-transparent hover:border-brand-gray/50"
                    />
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 py-4">
                <div className="flex items-start gap-4">
                    {/* Square-ish Avatar with rounded corners - Larger/Premium */}
                    <div className="relative shrink-0 group">
                        <div className={`
                            relative w-28 h-40 rounded-xl border-2 shadow-xl overflow-hidden bg-brand-wash
                            ${type === 'Music Director' || type === 'Movie Director' ? 'border-brand-accent/30 shadow-brand-accent/10' : 'border-white'}
                        `}>
                            <ImageWithFallback
                                src={imageUrl || undefined}
                                alt={name}
                                className="object-cover object-top"
                                fallbackClassName="bg-brand-wash text-zinc-400 flex items-center justify-center p-4"
                                priority={true}
                                sizes="112px"
                            />
                        </div>
                        {/* Admin Upload Control */}
                        <ArtistImageUpload artistName={name} currentImage={imageUrl || undefined} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <h1 className="text-2xl font-bold text-black leading-tight tracking-tight">{name}</h1>
                            {shareMetadata && (
                                <ShareButton
                                    variant="icon"
                                    title={shareMetadata.title}
                                    text={shareMetadata.text}
                                    className="shrink-0 w-8 h-8 !p-0 bg-brand-wash hover:bg-white border border-brand-gray/50 text-zinc-400 hover:text-brand-dark"
                                />
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
                            {movieCount !== undefined && movieCount > 0 && (
                                <span className="flex items-center gap-1 bg-brand-wash px-2.5 py-1 rounded-md text-zinc-600 border border-brand-gray/50 font-medium">
                                    <span className={type === 'Music Director' ? 'text-brand-accent' : 'text-zinc-500'}>{movieCount} Movies</span>
                                </span>
                            )}
                            <span className="bg-brand-wash px-2.5 py-1 rounded-md text-zinc-600 border border-brand-gray/50">
                                {ringtoneCount} Ringtones
                            </span>
                            <span className="flex items-center gap-1 bg-brand-wash px-2.5 py-1 rounded-md text-zinc-600 border border-brand-gray/50">
                                <Heart size={10} className="fill-zinc-400 text-zinc-400" />
                                {formatCount(totalLikes)} Likes
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bio - Collapsible/Compact */}
                {bio && (
                    <div className="mt-4 pt-3 border-t border-[#E5EBF1]">
                        <p className="text-sm text-zinc-500 line-clamp-3 leading-relaxed">
                            {bio}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
