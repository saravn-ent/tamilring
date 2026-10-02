import ImageWithFallback from './ImageWithFallback';
import { getImageUrl, TMDBImageSize } from '@/lib/tmdb';

interface TMDBImageProps {
    path: string | null | undefined;
    alt: string;
    fallbackAlt?: string; // Add this prop
    size?: TMDBImageSize;
    priority?: boolean;
    fetchPriority?: 'high' | 'low' | 'auto';
    className?: string;
    fill?: boolean;
    width?: number;
    height?: number;
    sizes?: string;
    quality?: number;
}

/**
 * Optimized Image component for TMDB images
 * Automatically handles responsive sizing and lazy loading with graceful fallback
 */
export default function TMDBImage({
    path,
    alt,
    fallbackAlt,
    size = 'w342',
    priority = false,
    fetchPriority,
    className = '',
    fill = false,
    sizes,
    quality = 75,
}: TMDBImageProps) {
    const src = getImageUrl(path, size);

    return (
        <ImageWithFallback
            src={src}
            alt={alt}
            fallbackAlt={fallbackAlt}
            fill={fill}
            sizes={sizes}
            quality={quality}
            priority={priority}
            fetchPriority={fetchPriority}
            className={className}
            showIcon
        />
    );
}
