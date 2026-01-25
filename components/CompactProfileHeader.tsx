'use client';

import { ArrowLeft, Heart, BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import ImageWithFallback from './ImageWithFallback';
import { formatCount } from '@/lib/utils';
import FavoriteButton from './FavoriteButton';
import ShareButton from './ShareButton';
import ArtistImageUpload from './ArtistImageUpload';

interface CompactProfileHeaderProps {
    name: string;
    type: 'Actor' | 'Singer' | 'Music Director' | 'Movie Director' | 'Lyricist';
    imageUrl?: string | null;
    bio?: string;
    shareMetadata?: { title: string; text: string };
}

export default function CompactProfileHeader({
    name,
    type,
    imageUrl,
    bio,
    shareMetadata
}: CompactProfileHeaderProps) {
    return (
        <div className="bg-white border-b border-zinc-200 transition-all duration-300">

            {/* Top Navigation Bar - Role Centered */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-100/50">
                <Link
                    href="/"
                    className="p-1 -ml-1 text-zinc-400 hover:text-brand-dark transition-colors"
                >
                    <ArrowLeft size={18} />
                </Link>

                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest">{type}</span>
                </div>

                <div className="flex items-center gap-2">
                    {shareMetadata && (
                        <ShareButton
                            variant="icon"
                            title={shareMetadata.title}
                            text={shareMetadata.text}
                            className="w-10 h-10 !p-0 bg-transparent hover:bg-brand-wash border-none text-zinc-400 hover:text-brand-dark rounded-full"
                        />
                    )}
                </div>
            </div>

            {/* Profile Content - Horizontal & Ultra Compact */}
            <div className="px-5 py-4">
                <div className="flex items-center gap-5">
                    {/* Small Circular Avatar */}
                    <div className="relative shrink-0">
                        <div className="relative w-14 h-14 rounded-full border-2 border-white shadow-lg overflow-hidden bg-brand-wash ring-1 ring-brand-border">
                            <ImageWithFallback
                                src={imageUrl || undefined}
                                alt={name}
                                className="object-cover"
                                fallbackClassName="bg-brand-wash text-zinc-300 flex items-center justify-center text-lg font-bold"
                                priority={true}
                                sizes="56px"
                            />
                        </div>
                        <ArtistImageUpload artistName={name} currentImage={imageUrl || undefined} />
                    </div>

                    {/* Information Cluster */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-xl font-black text-black leading-tight truncate tracking-tight">
                                {name}
                            </h1>
                            <BadgeCheck size={16} className="text-blue-500 fill-blue-500/10 shrink-0" />

                            <FavoriteButton
                                item={{
                                    id: name,
                                    name,
                                    type,
                                    imageUrl: imageUrl || undefined,
                                    href: type === 'Actor' ? `/actor/${encodeURIComponent(name)}` : `/artist/${encodeURIComponent(name)}`
                                }}
                                className="ml-1 w-7 h-7 !bg-white !text-red-500 border border-red-100 shadow-sm hover:scale-110"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

