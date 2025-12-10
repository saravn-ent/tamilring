'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

interface FacadeEmbedProps {
    src: string;
    title: string;
    thumbnail: string;
    width?: number;
    height?: number;
    className?: string;
    type?: 'youtube' | 'iframe';
}

/**
 * FacadeEmbed Component
 * Implements "Facade Loading" pattern to defer heavy third-party embeds
 * until the user explicitly interacts (clicks).
 */
export default function FacadeEmbed({
    src,
    title,
    thumbnail,
    width = 560,
    height = 315,
    className = '',
    type = 'iframe'
}: FacadeEmbedProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    const handleLoad = () => {
        setIsLoaded(true);
    };

    if (isLoaded) {
        if (type === 'youtube') {
            return (
                <iframe
                    width={width}
                    height={height}
                    src={`${src}?autoplay=1`}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className={`w-full h-full rounded-xl ${className}`}
                />
            );
        }
        return (
            <iframe
                width={width}
                height={height}
                src={src}
                title={title}
                className={`w-full h-full rounded-xl ${className}`}
            />
        );
    }

    return (
        <div
            className={`relative group cursor-pointer overflow-hidden rounded-xl bg-neutral-900 ${className}`}
            style={{ aspectRatio: `${width}/${height}` }}
            onClick={handleLoad}
        >
            <Image
                src={thumbnail}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110">
                    <Play fill="white" className="ml-1 text-white" size={32} />
                </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm p-2 rounded text-white text-xs font-medium truncate">
                {title}
            </div>
        </div>
    );
}
