'use client';

import { Share2, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonProps {
    title: string;
    text?: string;
    url?: string;
    className?: string; // Allow custom styling
    variant?: 'default' | 'icon';
}

export default function ShareButton({ title, text, url, className = '', variant = 'default' }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const shareUrl = url || window.location.href;
        const shareData = {
            title: title,
            text: text || `Check out ${title} on TamilRing!`,
            url: shareUrl,
        };

        // 1. Try Native Web Share API (Mobile/PWA)
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
                return;
            } catch (err) {
                console.warn('Share API failed, falling back to clipboard', err);
            }
        }

        // 2. Fallback: Copy to Clipboard
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    if (variant === 'icon') {
        return (
            <button
                onClick={handleShare}
                className={`relative flex items-center justify-center p-3 bg-neutral-800/80 backdrop-blur-md text-zinc-100 rounded-full hover:bg-neutral-700 active:scale-95 transition-all shadow-lg border border-white/5 ${className}`}
                aria-label="Share"
            >
                {copied ? <Check size={20} className="text-emerald-500" /> : <Share2 size={20} />}
                {copied && (
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded shadow-lg animate-in fade-in zoom-in duration-200 whitespace-nowrap pointer-events-none">
                        Copied!
                    </span>
                )}
            </button>
        );
    }

    return (
        <button
            onClick={handleShare}
            className={`relative flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-800 text-zinc-100 rounded-xl font-medium hover:bg-neutral-700 active:scale-95 transition-all text-sm ${className}`}
            aria-label="Share"
        >
            {copied ? <Check size={18} className="text-emerald-500" /> : <Share2 size={18} />}
            <span>{copied ? 'Copied' : 'Share'}</span>

            {/* Toast Feedback */}
            {copied && (
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded shadow-lg animate-in fade-in zoom-in duration-200 whitespace-nowrap">
                    URL Copied!
                </span>
            )}
        </button>
    );
}
