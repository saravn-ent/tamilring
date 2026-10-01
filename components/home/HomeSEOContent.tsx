import Link from 'next/link';

const POPULAR_SEARCHES = [
    { label: 'Anirudh BGM', href: '/ringtones/anirudh' },
    { label: 'AR Rahman', href: '/ringtones/ar-rahman' },
    { label: 'Yuvan Shankar Raja', href: '/ringtones/yuvan' },
    { label: 'Harris Jayaraj', href: '/ringtones/harris-jayaraj' },
    { label: 'Ilaiyaraaja', href: '/ringtones/ilaiyaraaja' },
    { label: 'D. Imman', href: '/ringtones/d-imman' },
    { label: 'Love BGM', href: '/ringtones/love-bgm' },
    { label: 'Sad BGM', href: '/ringtones/sad-bgm' },
    { label: 'Mass BGM', href: '/ringtones/mass-bgm' },
    { label: '2025 Hits', href: '/ringtones/2025-hits' },
    { label: '90s Classics', href: '/ringtones/90s-hits' },
    { label: 'iPhone Guide', href: '/iphone-ringtone-guide' },
];

export default function HomeSEOContent() {
    return (
        <section className="w-full max-w-4xl mx-auto px-4 py-8 border-t border-m3-outline-variant/20 mt-4 mb-4">
            {/* Popular Searches — visible, crawlable internal links */}
            <div>
                <h2 className="text-sm font-bold text-m3-on-surface-variant uppercase tracking-widest mb-3">
                    Popular Searches
                </h2>
                <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="px-3 py-1.5 rounded-full border border-m3-outline-variant/50 text-xs font-medium text-m3-on-surface-variant hover:text-m3-primary hover:border-m3-primary transition-colors"
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
