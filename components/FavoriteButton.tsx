'use client';

import { Heart } from 'lucide-react';
import { useFavorites, FavoriteItem } from '@/context/FavoritesContext';
import { useToast } from '@/context/ToastContext';
import RippleWrapper from './Ripple';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  item: FavoriteItem;
  className?: string;
  iconSize?: number;
}

export default function FavoriteButton({ item, className = "", iconSize = 18 }: FavoriteButtonProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { showToast } = useToast();
  const isFav = isFavorite(item.id);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFav) {
      removeFavorite(item.id);
      hapticFeedback(hapticPatterns.selection);
      showToast(`Removed ${item.name} from Favorites`, 'info');
    } else {
      addFavorite(item);
      hapticFeedback(hapticPatterns.heartbeat);
      showToast(`Added ${item.name} to Favorites ❤️`, 'favorite');
    }
  };

  return (
    <RippleWrapper
      onClick={handleToggle}
      className={cn(
        "w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-90 cursor-pointer",
        isFav 
          ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30 shadow-2xs' 
          : 'bg-m3-surface-container text-m3-on-surface-variant hover:text-m3-primary hover:bg-m3-surface-container-high',
        className
      )}
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart 
        size={iconSize} 
        className={cn("transition-colors", isFav ? "fill-rose-500 text-rose-500" : "text-current")} 
      />
    </RippleWrapper>
  );
}

