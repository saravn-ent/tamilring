import Image from 'next/image';
import { getImageUrl, getImageSrcSet, TMDBImageSize } from '@/lib/tmdb';

interface TMDBImageProps {
    path: string | null;
    alt: string;
    size?: TMDBImageSize;
    priority?: boolean;
    className?: string;
    fill?: boolean;
    width?: number;
    height?: number;
    sizes?: string;
    quality?: number;
}

/**
 * Optimized Image component for TMDB images
 * Automatically handles responsive sizing and lazy loading
 */
export default function TMDBImage({
    path,
    alt,
    size = 'w342',
    priority = false,
    className = '',
    fill = false,
    width,
    height,
    sizes,
    quality = 75,
}: TMDBImageProps) {
    if (!path) {
        return (
            <div className={`bg-neutral-800 flex items-center justify-center ${className}`}>
                <span className="text-neutral-600 text-xs">No Image</span>
            </div>
        );
    }

    const src = getImageUrl(path, size);

    return (
        <Image
            src={src}
            alt={alt}
            fill={fill}
            width={width}
            height={height}
            sizes={sizes}
            quality={quality}
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            className={className}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
        />
    );
}
