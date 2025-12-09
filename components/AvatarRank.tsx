
'use client';

import Image from 'next/image';
import { User, Shield, Disc, Sparkles, Crown, Zap } from 'lucide-react';
import { getLevelTitle } from '@/lib/gamification';

interface AvatarRankProps {
    image?: string | null;
    point: number; // Changed from points to point to potentially avoid conflicts if any, or just sticking to simpler prop names
    level: number;
    size?: 'sm' | 'md' | 'lg';
}

const LEVEL_COLORS = {
    1: 'border-zinc-500 text-zinc-500', // Listener (Gray)
    2: 'border-emerald-500 text-emerald-500', // Creator (Green)
    3: 'border-blue-500 text-blue-500', // Composer (Blue)
    4: 'border-purple-500 text-purple-500', // Maestro (Purple)
    5: 'border-amber-500 text-amber-500', // Legend (Gold)
};

const LEVEL_ICONS = {
    1: Disc,
    2: Shield,
    3: Zap,
    4: Sparkles,
    5: Crown
};

export default function AvatarRank({ image, point, level, size = 'md' }: AvatarRankProps) {
    // Cap max level color/icon at 5
    const normalizedLevel = Math.min(Math.max(level, 1), 5) as keyof typeof LEVEL_COLORS;

    const sizeClasses = {
        sm: 'w-10 h-10',
        md: 'w-20 h-20',
        lg: 'w-32 h-32'
    };

    const iconSize = size === 'sm' ? 12 : (size === 'md' ? 20 : 32);
    const Icon = LEVEL_ICONS[normalizedLevel];
    const colorClass = LEVEL_COLORS[normalizedLevel];

    return (
        <div className="relative inline-block">
            {/* Avatar Container with Rank Border */}
            <div className={`${sizeClasses[size]} rounded-full border-2 ${colorClass.split(' ')[0]} overflow-hidden relative shadow-lg bg-neutral-800`}>
                {image ? (
                    <Image src={image} alt="User" fill className="object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500">
                        <User size={size === 'sm' ? 20 : (size === 'md' ? 32 : 48)} />
                    </div>
                )}
            </div>

            {/* Rank Shield/Icon Overlay */}
            <div className={`absolute -bottom-1 -right-1 bg-neutral-900 rounded-full p-1.5 border-2 ${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]} shadow-sm transform hover:scale-110 transition-transform`}>
                <Icon size={iconSize} fill="currentColor" className="opacity-80" />
            </div>
        </div>
    );
}
