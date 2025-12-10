'use client';

import Link from 'next/link';
import ImageWithFallback from './ImageWithFallback';

interface HeroCardProps {
  name: string;
  image: string;
  href: string;
  subtitle?: string;
  index?: number;
}

export default function HeroCard({ name, image, href, subtitle, index = 0 }: HeroCardProps) {
  return (
    <Link
      href={href}
      className="relative shrink-0 w-32 h-48 rounded-xl overflow-hidden group transition-transform duration-300 hover:z-10 hover:scale-105 hover:-translate-y-2 shadow-lg shadow-black/40 border border-white/5"
      style={{
        marginLeft: index === 0 ? 0 : '-12px', // Overlap effect
        zIndex: index
      }}
    >
      {/* Full Bleed Image */}
      <div className="absolute inset-0 bg-neutral-800">
        <ImageWithFallback
          src={image}
          alt={name}
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col justify-end h-full">
        <div className="h-9 flex items-center mb-0.5">
          <h3 className="text-white font-bold text-sm leading-tight drop-shadow-md group-hover:text-emerald-400 transition-colors line-clamp-2">
            {name}
          </h3>
        </div>
        {subtitle && (
          <p className="text-[10px] text-zinc-400 font-medium tracking-wider mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Shine Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </Link>
  );
}
