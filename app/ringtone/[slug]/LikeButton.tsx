'use client';

import { Heart } from 'lucide-react';
import { Ringtone } from '@/types';
import { useFavorites } from '@/context/FavoritesContext';
import { incrementLikes } from '@/app/actions/ringtones';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';

interface LikeButtonProps {
    ringtone: Ringtone;
    onLike?: (count: number) => void;
    className?: string;
    showCount?: boolean;
}

export default function LikeButton({ ringtone, onLike, className = '', showCount = true }: LikeButtonProps) {
    const { isFavorite, addFavorite, removeFavorite } = useFavorites();
    const { t } = useLanguage();
    const { showToast } = useToast();
    const isLiked = isFavorite(ringtone.id);
    const [localLikes, setLocalLikes] = useState(ringtone.likes || 0);

    const formatCount = (count: number) => {
        if (!count || count <= 0) return '0';
        if (count >= 1000000) return `${(count / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
        return count.toString();
    };

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isLiked) {
            hapticFeedback(hapticPatterns.heartbeat);
            addFavorite({
                id: ringtone.id,
                name: ringtone.title,
                type: 'Ringtone',
                imageUrl: ringtone.poster_url,
                href: `/ringtone/${ringtone.slug}`,
                ringtoneData: ringtone
            });
            const newCount = localLikes + 1;
            setLocalLikes(newCount);
            if (onLike) onLike(newCount);
            showToast('Added to Favorites ❤️', 'success');
            await incrementLikes(ringtone.id);
        } else {
            hapticFeedback(hapticPatterns.selection);
            removeFavorite(ringtone.id);
            const newCount = Math.max(0, localLikes - 1);
            setLocalLikes(newCount);
            if (onLike) onLike(newCount);
            showToast('Removed from Favorites', 'info');
        }
    };

    return (
        <button
            type="button"
            onClick={handleLike}
            className={`flex-1 w-full h-10 px-3.5 rounded-full transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer font-bold text-xs sm:text-sm border shadow-xs ${
                isLiked
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-400 dark:border-rose-700'
                    : 'bg-m3-surface-container-low border-m3-outline-variant/70 text-m3-on-surface hover:bg-m3-surface-container'
            } ${className}`}
            aria-label={isLiked ? `${t('unlike')} (${formatCount(localLikes)})` : `${t('like')} (${formatCount(localLikes)})`}
        >
            <Heart size={16} className={`transition-transform duration-200 ${isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-m3-on-surface'}`} />
            <span className="font-bold text-m3-on-surface">{isLiked ? 'Liked' : 'Like'}</span>
            {showCount && localLikes > 0 && (
                <span className={`text-[11px] font-bold tabular-nums px-2 py-0.5 rounded-full leading-none transition-colors ${
                    isLiked 
                        ? 'bg-rose-500 text-white shadow-2xs' 
                        : 'bg-m3-surface-container-high text-m3-on-surface'
                }`}>
                    {formatCount(localLikes)}
                </span>
            )}
        </button>
    );
}



