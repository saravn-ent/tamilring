'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { hapticFeedback } from '@/lib/haptics';

interface BackButtonProps {
    fallbackHref?: string;
    className?: string;
    variant?: 'default' | 'minimal';
}

export default function BackButton({ fallbackHref = '/', className = '', variant = 'default' }: BackButtonProps) {
    const router = useRouter();

    const handleBack = () => {
        hapticFeedback(10);
        // Simple history back
        if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
        } else {
            router.push(fallbackHref);
        }
    };

    if (variant === 'minimal') {
        return (
            <button
                onClick={handleBack}
                className={`p-2 text-zinc-400 hover:text-brand-dark transition-colors ${className}`}
                aria-label="Go back"
            >
                <ArrowLeft size={20} strokeWidth={2.5} />
            </button>
        );
    }

    return (
        <button
            onClick={handleBack}
            className={`inline-flex items-center gap-2 text-brand-dark hover:text-brand-accent bg-white/80 backdrop-blur-md border border-brand-gray px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 ${className}`}
        >
            <ArrowLeft size={20} strokeWidth={2.5} />
            <span className="text-sm font-semibold">Back</span>
        </button>
    );
}
