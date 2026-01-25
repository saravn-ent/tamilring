'use client';

import Link from 'next/link';
import { Music, Heart, MessageCircle, Smile, Bell, Zap, Flame, Star, CloudRain } from 'lucide-react';
import SectionHeader from './SectionHeader';
import { hapticFeedback } from '@/lib/haptics';

const CATEGORIES = [
    { id: 'bgm', label: 'BGM', icon: Music, className: 'bg-violet-100 text-violet-700 border-violet-200', href: '/category/bgm' },
    { id: 'love', label: 'Love', icon: Heart, className: 'bg-rose-100 text-rose-700 border-rose-200', href: '/mood/Love' },
    { id: 'mass', label: 'Mass', icon: Flame, className: 'bg-orange-100 text-orange-700 border-orange-200', href: '/mood/Mass' },
    { id: 'melody', label: 'Melody', icon: Music, className: 'bg-cyan-100 text-cyan-700 border-cyan-200', href: '/mood/Melody' },
    { id: 'sad', label: 'Sad', icon: CloudRain, className: 'bg-indigo-100 text-indigo-700 border-indigo-200', href: '/mood/Sad' },
    { id: 'dialogue', label: 'Dialogue', icon: MessageCircle, className: 'bg-blue-100 text-blue-700 border-blue-200', href: '/category/dialogue' },
    { id: 'devotional', label: 'Devotional', icon: Zap, className: 'bg-emerald-100 text-emerald-700 border-emerald-200', href: '/mood/Devotional' },
    { id: 'remix', label: 'Remix', icon: Star, className: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200', href: '/mood/Remix' },
];

export default function CategoryGrid() {
    return (
        <div className="mb-8">
            <div className="px-4">
                <SectionHeader title="Browse Collections" translationKey="categories" />
            </div>

            <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide snap-x">
                {CATEGORIES.map((cat) => (
                    <Link
                        key={cat.id}
                        href={cat.href}
                        onClick={() => hapticFeedback(10)}
                        className={`snap-start shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl border border-opacity-50 transition-all active:scale-95 ${cat.className}`}
                    >
                        <cat.icon size={16} strokeWidth={2.5} />
                        <span className="text-sm font-bold whitespace-nowrap">{cat.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
