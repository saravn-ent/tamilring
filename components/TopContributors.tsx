'use client';

import Link from 'next/link';
import ImageWithFallback from './ImageWithFallback';
import { TOP_CONTRIBUTORS } from '@/lib/constants';

export default function TopContributors() {
  return (
    <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide -mx-4">
      {TOP_CONTRIBUTORS.map((user, idx) => (
        <Link 
          key={idx} 
          href={`/user/${encodeURIComponent(user.name)}`}
          className="flex flex-col items-center gap-2 min-w-[80px] group"
        >
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-neutral-800 relative group-hover:border-emerald-500 transition-colors shadow-lg">
             <ImageWithFallback
                src={user.img}
                alt={user.name}
                fill
                className="object-cover"
                fallbackText={user.name[0]}
              />
          </div>
          <div className="text-center">
            <span className="block text-xs font-medium text-zinc-200 truncate w-20 group-hover:text-emerald-400 transition-colors">
                {user.name}
            </span>
            <span className="block text-[10px] text-zinc-500">
                {user.uploads} Ringtones
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
