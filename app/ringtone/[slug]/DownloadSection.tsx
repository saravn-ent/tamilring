'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import Link from 'next/link';
import { Ringtone } from '@/types';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';
import PlayButton from './PlayButton';
import DownloadButton from './DownloadButton';
import LikeButton from './LikeButton';

interface DownloadSectionProps {
    ringtone: Ringtone;
    className?: string;
}

export default function DownloadSection({ ringtone, className = '' }: DownloadSectionProps) {
    const [downloadCount, setDownloadCount] = useState(ringtone.downloads || 0);
    const [likeCount, setLikeCount] = useState(ringtone.likes || 0);
    const [hasIncremented, setHasIncremented] = useState(false);

    const handleDownload = () => {
        if (!hasIncremented) {
            setDownloadCount(prev => prev + 1);
            setHasIncremented(true);
        }
    };

    const handleShare = async () => {
        hapticFeedback(hapticPatterns.selection);
        const shareUrl = `${window.location.origin}/ringtone/${ringtone.slug}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${ringtone.title} Ringtone`,
                    text: `Listen to ${ringtone.title} on TamilRing`,
                    url: shareUrl,
                });
            } catch {
                // Ignore share cancellation
            }
        } else {
            await navigator.clipboard.writeText(shareUrl);
        }
    };

    return (
        <section aria-label="Audio Controls & Download" className={`flex flex-col items-center gap-3 w-full max-w-sm ${className}`}>
            {/* Ergonomic M3 Action Grid (Play & Download, Like & Share) */}
            <div className="flex flex-col gap-2.5 w-full">
                {/* Row 1: Primary Actions */}
                <div className="grid grid-cols-2 gap-2.5 w-full">
                    <PlayButton ringtone={ringtone} />
                    <DownloadButton 
                        ringtone={ringtone} 
                        onDownload={handleDownload}
                        downloadCount={downloadCount}
                    />
                </div>

                {/* Row 2: Secondary Social Actions */}
                <div className="grid grid-cols-2 gap-2.5 w-full">
                    <LikeButton 
                        ringtone={ringtone} 
                        onLike={(count: number) => setLikeCount(count)}
                        showCount={true}
                    />

                    <button
                        type="button"
                        onClick={handleShare}
                        className="flex-1 w-full h-10 px-3.5 rounded-full bg-m3-surface-container-low hover:bg-m3-surface-container border border-m3-outline-variant/50 text-m3-on-surface text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                    >
                        <Share2 size={16} className="text-m3-on-surface-variant" />
                        <span>Share</span>
                    </button>
                </div>
            </div>

            {/* Uploader Attribution (if present) */}
            {ringtone.profile?.full_name && (
                <div className="text-xs text-m3-outline text-center mt-1">
                    Uploaded by{' '}
                    <Link
                        href={`/user/${ringtone.profile.id}`}
                        className="text-m3-primary font-semibold hover:underline"
                    >
                        {ringtone.profile.full_name}
                    </Link>
                </div>
            )}
        </section>
    );
}

