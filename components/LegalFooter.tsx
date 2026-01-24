'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function LegalFooter() {
    const { t } = useLanguage();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <footer className="text-center space-y-4">
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs h-4" />
                <p className="text-[11px] text-zinc-600">
                    TamilRing © {new Date().getFullYear()} • User Generated Content
                </p>
            </footer>
        );
    }

    return (
        <footer className="text-center space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
                <Link href="/legal/dmca" className="text-zinc-600 hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                    <span className="text-base">⚖️</span>
                    <span>{t('dmca')}</span>
                </Link>
                <span className="text-zinc-700">•</span>
                <Link href="/legal/terms" className="text-zinc-600 hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                    <span className="text-base">📄</span>
                    <span>{t('terms')}</span>
                </Link>
                <span className="text-zinc-700">•</span>
                <Link href="/privacy" className="text-zinc-600 hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                    <span className="text-base">🛡️</span>
                    <span>{t('privacy')}</span>
                </Link>
                <span className="text-zinc-700">•</span>
                <Link href="/contact" className="text-zinc-600 hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                    <span className="text-base">💬</span>
                    <span>{t('contact')}</span>
                </Link>
            </div>
            <p suppressHydrationWarning className="text-[11px] text-zinc-600">
                TamilRing © {new Date().getFullYear()} • User Generated Content
            </p>
        </footer>
    );
}
