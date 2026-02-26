'use client';

import { Heart } from 'lucide-react';
import { Ringtone } from '@/types';
import { useFavorites } from '@/context/FavoritesContext';
import { incrementLikes } from '@/app/actions/ringtones';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface LikeButtonProps {
    ringtone: Ringtone;
    onLike?: (count: number) => void;
}

export default function LikeButton({ ringtone, onLike }: LikeButtonProps) {
    const { isFavorite, addFavorite, removeFavorite } = useFavorites();
    const { t } = useLanguage();
    const isLiked = isFavorite(ringtone.id);
    const [localLikes, setLocalLikes] = useState(ringtone.likes || 0);

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
            await incrementLikes(ringtone.id);
        } else {
            hapticFeedback(hapticPatterns.selection);
            removeFavorite(ringtone.id);
            const newCount = Math.max(0, localLikes - 1);
            setLocalLikes(newCount);
            if (onLike) onLike(newCount);
            // We don't have a decrementLikes action currently, but we follow the UI state
        }
    };

    return (
        <button
            onClick={handleLike}
            className={`flex-1 font-normal py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 border ${
                isLiked
                    ? 'bg-rose-50 border-rose-200 text-rose-500'
                    : 'bg-brand-wash border-brand-border text-black hover:bg-white'
            }`}
        >
            <Heart size={18} strokeWidth={1.5} className={isLiked ? 'fill-current' : ''} />
            <span className="text-sm">{isLiked ? t('unlike') : t('like')}</span>
        </button>
    );
}
