'use client';

import { useFavorites } from '@/context/FavoritesContext';
import Link from 'next/link';
import ImageWithFallback from './ImageWithFallback';

export default function FavoritesList() {
  const { favorites } = useFavorites();

  if (favorites.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 text-sm bg-neutral-900/50 rounded-xl border border-dashed border-neutral-800">
        <p>No favorites yet.</p>
        <Link href="/" className="text-emerald-500 hover:underline mt-1 inline-block">
          Go explore!
        </Link>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
      {favorites.map((item) => (
        <Link 
          key={item.id} 
          href={item.href}
          className="flex flex-col items-center gap-2 min-w-[80px] group"
        >
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-neutral-800 relative group-hover:border-emerald-500 transition-colors">
             <ImageWithFallback
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover"
                fallbackText={item.name[0]}
              />
          </div>
          <span className="text-xs text-zinc-300 text-center truncate w-full group-hover:text-emerald-400 transition-colors">
            {item.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
