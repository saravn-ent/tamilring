'use client';

import Link from 'next/link';
import { Music, Heart, MessageCircle, CloudRain, Flame, Zap, Star } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { TranslationKeys } from '@/lib/i18n';

interface CategoryItem {
    id: string;
    label: string;
    translationKey: TranslationKeys;
    icon: React.ElementType;
    className: string;
    href: string;
}

const CATEGORIES: CategoryItem[] = [
    { id: 'valentines', label: "Valentine's", translationKey: 'valentine', icon: Heart, className: 'bg-rose-500 text-white border-rose-600 shadow-rose-200 shadow-md animate-pulse', href: '/valentines' },
    { id: 'bgm', label: 'BGM', translationKey: 'bgm', icon: Music, className: 'bg-violet-100 text-violet-700 border-violet-200', href: '/category/bgm' },
    { id: 'love', label: 'Love', translationKey: 'love', icon: Heart, className: 'bg-rose-100 text-rose-700 border-rose-200', href: '/mood/Love' },
    { id: 'mass', label: 'Mass', translationKey: 'mass', icon: Flame, className: 'bg-orange-100 text-orange-700 border-orange-200', href: '/mood/Mass' },
    { id: 'melody', label: 'Melody', translationKey: 'melody', icon: Music, className: 'bg-cyan-100 text-cyan-700 border-cyan-200', href: '/mood/Melody' },
    { id: 'sad', label: 'Sad', translationKey: 'sad', icon: CloudRain, className: 'bg-indigo-100 text-indigo-700 border-indigo-200', href: '/mood/Sad' },
    { id: 'dialogue', label: 'Dialogue', translationKey: 'dialogue', icon: MessageCircle, className: 'bg-blue-100 text-blue-700 border-blue-200', href: '/category/dialogue' },
    { id: 'devotional', label: 'Devotional', translationKey: 'devotional', icon: Zap, className: 'bg-emerald-100 text-emerald-700 border-emerald-200', href: '/mood/Devotional' },
    { id: 'remix', label: 'Remix', translationKey: 'remix', icon: Star, className: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200', href: '/mood/Remix' },
];

export default function CategoryGrid() {
    const { t } = useLanguage();

    return (
        <div className="mb-8">
            <div className="px-4 text-center mt-6">
                <h2 className="text-lg font-display font-bold text-black">{t('browseCollections')}</h2>
            </div>

            <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide snap-x mt-4 md:grid md:grid-cols-3 lg:grid-cols-5 md:overflow-visible md:justify-items-center">
                {CATEGORIES.map((cat) => (
                    <Link
                        key={cat.id}
                        href={cat.href}
                        className={`snap-start shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl border border-opacity-50 transition-all hover:opacity-80 active:scale-95 ${cat.className} md:w-full md:justify-center`}
                    >
                        <cat.icon size={16} strokeWidth={2.5} />
                        <span className="text-sm font-bold whitespace-nowrap">{t(cat.translationKey) || cat.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
