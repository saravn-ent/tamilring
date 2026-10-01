'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import Link from 'next/link';
import { Ringtone } from '@/types';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';
import { useToast } from '@/context/ToastContext';
import RingtoneWaveformPlayer from '@/components/ringtone/RingtoneWaveformPlayer';
import DownloadButton from './DownloadButton';
import LikeButton from './LikeButton';
import RingtoneSetGuideTrigger from './RingtoneSetGuideTrigger';

interface DownloadSectionProps {
    ringtone: Ringtone;
    className?: string;
}

export default function DownloadSection({ ringtone, className = '' }: DownloadSectionProps) {
    const [downloadCount, setDownloadCount] = useState(ringtone.downloads || 0);
    const [likeCount, setLikeCount] = useState(ringtone.likes || 0);
    const [hasIncremented, setHasIncremented] = useState(false);
    const [copied, setCopied] = useState(false);
    const { showToast } = useToast();

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
                return;
            } catch {
                // User cancelled share
            }
        }

        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            showToast('Link copied to clipboard! 📋', 'success');
            setTimeout(() => setCopied(false), 2500);
        } catch {
            showToast('Failed to copy link', 'error');
        }
    };

    return (
        <section aria-label="Audio Controls & Download" className={`flex flex-col items-center gap-3 w-full max-w-sm sm:max-w-md ${className}`}>
            {/* 1. Interactive Waveform Audio Player Console */}
            <RingtoneWaveformPlayer ringtone={ringtone} />

            {/* 2. Primary High-Conversion CTA: Full-Width Smart Download */}
            <div className="w-full">
                <DownloadButton 
                    ringtone={ringtone} 
                    onDownload={handleDownload}
                    downloadCount={downloadCount}
                />
            </div>

            {/* 3. Secondary Social Actions (Like & Share) */}
            <div className="grid grid-cols-2 gap-2.5 w-full">
                <LikeButton 
                    ringtone={ringtone} 
                    onLike={(count: number) => setLikeCount(count)}
                    showCount={true}
                />

                <button
                    type="button"
                    onClick={handleShare}
                    className={`flex-1 w-full h-10 px-3.5 rounded-full border text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs ${
                        copied
                            ? 'bg-m3-primary-container text-m3-on-primary-container border-m3-primary/40'
                            : 'bg-m3-surface-container-low hover:bg-m3-surface-container border-m3-outline-variant/70 text-m3-on-surface'
                    }`}
                    aria-label={copied ? 'Link copied' : 'Share Ringtone'}
                >
                    {copied ? (
                        <>
                            <Check size={16} className="text-m3-primary animate-in zoom-in" />
                            <span>Copied!</span>
                        </>
                    ) : (
                        <>
                            <Share2 size={16} className="text-m3-on-surface" />
                            <span className="text-m3-on-surface font-bold">Share</span>
                        </>
                    )}
                </button>
            </div>

            {/* 4. Helpful Setup Guide Link */}
            <div className="w-full flex justify-center pt-0.5">
                <RingtoneSetGuideTrigger />
            </div>

            {/* 5. Uploader Attribution (if present) */}
            {ringtone.profile?.full_name && (
                <div className="text-xs text-m3-on-surface-variant font-medium text-center mt-1">
                    Uploaded by{' '}
                    <Link
                        href={`/user/${ringtone.profile.id}`}
                        className="text-m3-primary font-bold hover:underline"
                    >
                        {ringtone.profile.full_name}
                    </Link>
                </div>
            )}
        </section>
    );
}
