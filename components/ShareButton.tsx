'use client';

import { Share2, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';
import { useToast } from '@/context/ToastContext';

interface ShareButtonProps {
    title: string;
    text?: string;
    url?: string;
    className?: string; // Allow custom styling
    variant?: 'default' | 'icon';
}

export default function ShareButton({ title, text, url, className = '', variant = 'default' }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);
    const { showToast } = useToast();

    const handleShare = async () => {
        const shareUrl = url || window.location.href;
        const shareData = {
            title: title,
            text: text || `Check out ${title} on TamilRing!`,
            url: shareUrl,
        };

        // 1. Try Native Web Share API (Mobile/PWA)
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share(shareData);
                hapticFeedback(hapticPatterns.success);
                return;
            } catch (err) {
                // Only log error if it's not a user cancellation
                if ((err as Error).name !== 'AbortError') {
                    console.warn('Share API failed', err);
                } else {
                    return; // User cancelled, don't fallback to clipboard
                }
            }
        }

        // 2. Fallback: Copy to Clipboard
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            showToast('Link copied to clipboard! 📋', 'success');
            hapticFeedback(hapticPatterns.selection);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
            showToast('Failed to copy link', 'error');
        }
    };

    if (variant === 'icon') {
        return (
            <button
                onClick={handleShare}
                className={cn(
                    "relative w-10 h-10 flex items-center justify-center bg-m3-surface-container text-m3-on-surface rounded-full hover:bg-m3-surface-container-high active:scale-90 transition-all border border-m3-outline-variant/40 cursor-pointer shadow-2xs",
                    className
                )}
                aria-label="Share"
            >
                {copied ? <Check size={18} className="text-m3-primary" /> : <Share2 size={18} />}
                {copied && (
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-m3-inverse-surface text-m3-inverse-on-surface text-[10px] font-bold px-2 py-1 rounded-md shadow-lg animate-in fade-in zoom-in duration-200 whitespace-nowrap pointer-events-none z-50">
                        Copied!
                    </span>
                )}
            </button>
        );
    }

    return (
        <button
            onClick={handleShare}
            className={cn(
                "relative flex items-center justify-center gap-2 h-11 px-5 bg-m3-secondary-container text-m3-on-secondary-container rounded-full font-bold hover:bg-m3-secondary-container/80 active:scale-95 transition-all text-sm cursor-pointer",
                className
            )}
            aria-label="Share"
        >
            {copied ? <Check size={18} className="text-m3-primary" /> : <Share2 size={18} />}
            <span>{copied ? 'Copied' : 'Share'}</span>

            {/* Toast Feedback */}
            {copied && (
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-m3-inverse-surface text-m3-inverse-on-surface text-xs font-bold px-2.5 py-1 rounded-md shadow-lg animate-in fade-in zoom-in duration-200 whitespace-nowrap">
                    URL Copied!
                </span>
            )}
        </button>
    );
}

