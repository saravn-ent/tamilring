'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

export default function LegalFooter() {
    const { t } = useLanguage();
    const pathname = usePathname();

    if (pathname?.startsWith('/admin')) return null;


    const links = [
        { href: '/legal/dmca', label: t('dmca') || 'DMCA' },
        { href: '/legal/terms', label: t('terms') || 'Terms' },
        { href: '/privacy', label: t('privacy') || 'Privacy' },
        { href: '/contact', label: t('contact') || 'Support' },
        { href: '/directory', label: 'Directory' },
    ];

    return (
        <footer className="w-full max-w-7xl mx-auto px-4 pt-3 pb-18 md:pb-6 text-center border-t border-m3-outline-variant/20">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] sm:text-xs">
                {links.map((link, idx) => (
                    <div key={link.href} className="inline-flex items-center gap-3">
                        <Link
                            href={link.href}
                            prefetch={false}
                            className="text-m3-on-surface-variant hover:text-m3-primary transition-colors font-medium"
                        >
                            {link.label}
                        </Link>
                        {idx < links.length - 1 && (
                            <span className="text-m3-outline-variant/50 select-none text-[10px]">·</span>
                        )}
                    </div>
                ))}
            </div>
            <p suppressHydrationWarning className="text-[10px] sm:text-[11px] text-m3-on-surface-variant/80 mt-1">
                TamilRing © {new Date().getFullYear()} · {t('userGeneratedContent')}
            </p>
        </footer>
    );
}

