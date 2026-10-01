'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';
import { cn } from '@/lib/utils';

interface BackButtonProps {
    fallbackHref?: string;
    className?: string;
    variant?: 'default' | 'minimal' | 'hero';
}

export default function BackButton({ fallbackHref = '/', className = '', variant = 'default' }: BackButtonProps) {
    const router = useRouter();

    const handleBack = () => {
        hapticFeedback(hapticPatterns.selection);
        if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
        } else {
            router.push(fallbackHref);
        }
    };

    if (variant === 'hero') {
        return (
            <button
                type="button"
                onClick={handleBack}
                className={cn(
                    "inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md shadow-xs transition-all active:scale-95 cursor-pointer text-xs font-semibold",
                    className
                )}
                aria-label="Go back"
            >
                <ArrowLeft size={14} className="shrink-0 text-white" />
                <span className="text-white">Back</span>
            </button>
        );
    }

    if (variant === 'minimal') {
        return (
            <button
                onClick={handleBack}
                className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-m3-on-surface-variant hover:text-m3-primary hover:bg-m3-on-surface/5 transition-colors cursor-pointer active:scale-90",
                    className
                )}
                aria-label="Go back"
            >
                <ArrowLeft size={20} />
            </button>
        );
    }

    return (
        <button
            onClick={handleBack}
            className={cn(
                "inline-flex items-center gap-1.5 text-m3-on-surface hover:text-m3-primary bg-m3-surface-container-low border border-m3-outline-variant/50 px-4 py-2 rounded-full shadow-2xs hover:shadow-xs hover:bg-m3-surface-container transition-all active:scale-95 cursor-pointer text-sm font-semibold",
                className
            )}
        >
            <ArrowLeft size={16} className="shrink-0 text-current" />
            <span className="text-current">Back</span>
        </button>
    );
}

