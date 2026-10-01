'use client';

import { ArrowLeft, Heart, BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import ImageWithFallback from './ImageWithFallback';
import { formatCount } from '@/lib/utils';
import FavoriteButton from './FavoriteButton';
import ShareButton from './ShareButton';
import DeityImageUpload from './DeityImageUpload';
import ArtistImageUpload from './ArtistImageUpload';
import BackButton from './BackButton';


interface CompactProfileHeaderProps {
    name: string;
    type: 'Actor' | 'Singer' | 'Music Director' | 'Movie Director' | 'Lyricist' | 'Deity';
    imageUrl?: string | null;
    bio?: string;
    shareMetadata?: { title: string; text: string };
    ringCount?: number;
}

export default function CompactProfileHeader({
    name,
    type,
    imageUrl,
    bio,
    shareMetadata,
    ringCount
}: CompactProfileHeaderProps) {
    return (
        <div className="bg-m3-surface-container-low border-b border-m3-outline-variant/30 text-m3-on-surface transition-all duration-300">

            {/* Top Navigation Bar - Role Centered */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-m3-outline-variant/20">
                <BackButton
                    variant="minimal"
                    fallbackHref="/"
                    className="-ml-1"
                />

                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-extrabold text-m3-primary uppercase tracking-widest">{type}</span>
                    {ringCount !== undefined && (
                        <span className="text-[9px] font-semibold text-m3-outline bg-m3-surface-container-high px-2 py-0.5 rounded-full mt-0.5 tabular-nums">
                            {ringCount} {ringCount === 1 ? 'Ring' : 'Rings'}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {shareMetadata && (
                        <ShareButton
                            variant="icon"
                            title={shareMetadata.title}
                            text={shareMetadata.text}
                            className="w-9 h-9 !p-0 bg-transparent hover:bg-m3-surface-container border-none text-m3-outline hover:text-m3-on-surface rounded-full"
                        />
                    )}
                </div>
            </div>

            {/* Profile Content - Horizontal & Space-Efficient */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4">
                <div className="flex items-center gap-4 sm:gap-5">
                    {/* Circular Avatar */}
                    <div className="relative shrink-0">
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-m3-surface shadow-md overflow-hidden bg-m3-surface-container ring-1 ring-m3-outline-variant/40">
                            <ImageWithFallback
                                src={imageUrl || undefined}
                                alt={name}
                                className="object-cover"
                                fallbackClassName="bg-m3-surface-container text-m3-outline flex items-center justify-center text-lg font-bold"
                                priority={true}
                                sizes="64px"
                            />
                        </div>
                        {type === 'Deity' ? (
                            <DeityImageUpload deityName={name} currentImage={imageUrl || undefined} />
                        ) : (
                            <ArtistImageUpload artistName={name} currentImage={imageUrl || undefined} />
                        )}
                    </div>

                    {/* Information Cluster */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-display font-extrabold text-m3-on-surface leading-tight truncate tracking-tight">
                                {name}
                            </h1>
                            <BadgeCheck size={18} className="text-blue-500 fill-blue-500/10 shrink-0" />

                            <FavoriteButton
                                item={{
                                    id: name,
                                    name,
                                    type,
                                    imageUrl: imageUrl || undefined,
                                    href: type === 'Actor' ? `/actor/${encodeURIComponent(name)}` : `/artist/${encodeURIComponent(name)}`
                                }}
                                className="ml-1 w-8 h-8 bg-m3-surface-container border border-m3-outline-variant/40 shadow-xs hover:scale-105"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

