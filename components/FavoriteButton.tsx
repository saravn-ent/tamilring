'use client';

import { Heart } from 'lucide-react';
import { useFavorites, FavoriteItem } from '@/context/FavoritesContext';
import RippleWrapper from './Ripple';

interface FavoriteButtonProps {
  item: FavoriteItem;
  className?: string;
}

export default function FavoriteButton({ item, className = "" }: FavoriteButtonProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const isFav = isFavorite(item.id);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFav) {
      removeFavorite(item.id);
    } else {
      addFavorite(item);
    }
  };

  return (
    <RippleWrapper
      onClick={handleToggle}
      className={`flex items-center justify-center rounded-full transition-all active:scale-90 ${className} ${isFav ? 'bg-red-500/10 text-red-500' : 'bg-neutral-800/50 text-zinc-400 hover:text-white'}`}
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart size={20} className={isFav ? "fill-current" : ""} />
    </RippleWrapper>
  );
}
