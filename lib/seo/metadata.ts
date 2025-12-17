import type { Metadata } from 'next';

/**
 * SEO Metadata Generation Utilities
 * Generates optimized metadata for all pages
 */

export interface SEOConfig {
    title: string;
    description: string;
    keywords?: string[];
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'music.song' | 'music.album' | 'profile';
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    tags?: string[];
    noIndex?: boolean;
    canonical?: string;
}

const SITE_NAME = 'TamilRing';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tamilring.com';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
const TWITTER_HANDLE = '@tamilring';

/**
 * Generate base metadata for the site
 */
export function generateBaseMetadata(): Metadata {
    return {
        metadataBase: new URL(SITE_URL),
        title: {
            default: `${SITE_NAME} - Tamil Ringtones & Music`,
            template: `%s | ${SITE_NAME}`,
        },
        description: 'Download the latest Tamil movie ringtones, devotional songs, and music. High-quality ringtones from Tamil cinema, independent artists, and devotional content.',
        keywords: [
            'tamil ringtones',
            'tamil songs',
            'tamil movie ringtones',
            'devotional ringtones',
            'tamil music',
            'ringtone download',
            'tamil cinema music',
            'kollywood ringtones',
        ],
        authors: [{ name: SITE_NAME }],
        creator: SITE_NAME,
        publisher: SITE_NAME,
        formatDetection: {
            email: false,
            address: false,
            telephone: false,
        },
        icons: {
            icon: '/favicon.ico',
            apple: '/apple-touch-icon.png',
        },
        manifest: '/manifest.json',
        appleWebApp: {
            capable: true,
            statusBarStyle: 'default',
            title: SITE_NAME,
        },
        verification: {
            google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
    };
}

/**
 * Generate metadata for a specific page
 */
export function generateMetadata(config: SEOConfig): Metadata {
    const {
        title,
        description,
        keywords = [],
        image = DEFAULT_IMAGE,
        url,
        type = 'website',
        author,
        publishedTime,
        modifiedTime,
        section,
        tags = [],
        noIndex = false,
        canonical,
    } = config;

    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const fullUrl = url ? `${SITE_URL}${url}` : SITE_URL;
    const canonicalUrl = canonical || fullUrl;

    const metadata: Metadata = {
        title,
        description,
        keywords: keywords.length > 0 ? keywords : undefined,
        authors: author ? [{ name: author }] : undefined,
        openGraph: {
            title: fullTitle,
            description,
            url: fullUrl,
            siteName: SITE_NAME,
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            locale: 'ta_IN',
            type,
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description,
            images: [image],
            creator: TWITTER_HANDLE,
            site: TWITTER_HANDLE,
        },
        alternates: {
            canonical: canonicalUrl,
        },
    };

    // Add article-specific metadata
    if (type === 'article' && (publishedTime || modifiedTime || section || tags.length > 0)) {
        metadata.openGraph = {
            ...metadata.openGraph,
            type: 'article',
            publishedTime,
            modifiedTime,
            section,
            tags,
        };
    }

    // Add noindex if specified
    if (noIndex) {
        metadata.robots = {
            index: false,
            follow: false,
        };
    }

    return metadata;
}

/**
 * Generate metadata for homepage
 */
export function generateHomeMetadata(): Metadata {
    return generateMetadata({
        title: 'Tamil Ringtones & Music - Download Latest Tamil Movie Ringtones',
        description: 'Download the latest Tamil movie ringtones, devotional songs, and music. Browse trending ringtones from Tamil cinema, independent artists, and devotional content. High-quality ringtones updated daily.',
        keywords: [
            'tamil ringtones',
            'tamil movie ringtones',
            'tamil songs download',
            'kollywood ringtones',
            'tamil music',
            'devotional ringtones',
            'tamil cinema music',
            'latest tamil ringtones',
        ],
        url: '/',
        type: 'website',
    });
}

/**
 * Generate metadata for ringtone page
 */
export function generateRingtoneMetadata(ringtone: {
    title: string;
    movie_name?: string;
    singers?: string;
    music_director?: string;
    artwork_url?: string;
    slug: string;
    created_at: string;
}): Metadata {
    const singers = ringtone.singers || 'Unknown Artist';
    const movie = ringtone.movie_name || '';
    const musicDirector = ringtone.music_director || '';

    const title = movie
        ? `${ringtone.title} - ${movie} Ringtone`
        : `${ringtone.title} Ringtone`;

    const description = movie
        ? `Download ${ringtone.title} ringtone from ${movie}. Sung by ${singers}${musicDirector ? `, Music by ${musicDirector}` : ''}. High-quality Tamil ringtone free download.`
        : `Download ${ringtone.title} ringtone by ${singers}. High-quality Tamil ringtone free download.`;

    const keywords = [
        ringtone.title,
        `${ringtone.title} ringtone`,
        movie ? `${movie} ringtone` : '',
        singers,
        musicDirector,
        'tamil ringtone',
        'download ringtone',
    ].filter(Boolean) as string[];

    return generateMetadata({
        title,
        description,
        keywords,
        image: ringtone.artwork_url || DEFAULT_IMAGE,
        url: `/ringtone/${ringtone.slug}`,
        type: 'music.song',
        publishedTime: ringtone.created_at,
        tags: keywords,
    });
}

/**
 * Generate metadata for movie page
 */
export function generateMovieMetadata(movie: {
    name: string;
    poster_url?: string;
    year?: string;
    director?: string;
    music_director?: string;
    ringtone_count?: number;
}): Metadata {
    const title = `${movie.name} Ringtones${movie.year ? ` (${movie.year})` : ''}`;

    const description = `Download ${movie.name} movie ringtones. ${movie.ringtone_count || 'Multiple'} high-quality ringtones from ${movie.name}${movie.music_director ? ` - Music by ${movie.music_director}` : ''}${movie.director ? `, Directed by ${movie.director}` : ''}. Free Tamil movie ringtones.`;

    const keywords = [
        movie.name,
        `${movie.name} ringtones`,
        `${movie.name} songs`,
        movie.music_director,
        movie.director,
        'tamil movie ringtones',
        'kollywood ringtones',
    ].filter(Boolean) as string[];

    return generateMetadata({
        title,
        description,
        keywords,
        image: movie.poster_url || DEFAULT_IMAGE,
        url: `/movie/${encodeURIComponent(movie.name)}`,
        type: 'website',
        tags: keywords,
    });
}

/**
 * Generate metadata for artist page
 */
export function generateArtistMetadata(artist: {
    name: string;
    image_url?: string;
    role?: 'singer' | 'music_director' | 'movie_director';
    ringtone_count?: number;
}): Metadata {
    const roleText = artist.role === 'singer'
        ? 'Singer'
        : artist.role === 'music_director'
            ? 'Music Director'
            : 'Director';

    const title = `${artist.name} - Tamil ${roleText} Ringtones`;

    const description = `Download ringtones featuring ${artist.name}, renowned Tamil ${roleText}. ${artist.ringtone_count || 'Multiple'} high-quality ringtones from ${artist.name}'s work. Free Tamil music ringtones.`;

    const keywords = [
        artist.name,
        `${artist.name} ringtones`,
        `${artist.name} songs`,
        `tamil ${roleText.toLowerCase()}`,
        'tamil music',
        'tamil ringtones',
    ].filter(Boolean) as string[];

    return generateMetadata({
        title,
        description,
        keywords,
        image: artist.image_url || DEFAULT_IMAGE,
        url: `/artist/${encodeURIComponent(artist.name)}`,
        type: 'profile',
        tags: keywords,
    });
}

/**
 * Generate metadata for search page
 */
export function generateSearchMetadata(query: string, resultCount?: number): Metadata {
    const title = `Search Results for "${query}"`;
    const description = resultCount !== undefined
        ? `Found ${resultCount} ringtones matching "${query}". Browse and download Tamil ringtones.`
        : `Search results for "${query}". Browse and download Tamil ringtones.`;

    return generateMetadata({
        title,
        description,
        keywords: [query, 'search', 'tamil ringtones'],
        url: `/search?q=${encodeURIComponent(query)}`,
        type: 'website',
        noIndex: true, // Don't index search result pages
    });
}

/**
 * Generate metadata for user profile page
 */
export function generateUserProfileMetadata(user: {
    username: string;
    display_name?: string;
    avatar_url?: string;
    ringtone_count?: number;
}): Metadata {
    const displayName = user.display_name || user.username;
    const title = `${displayName}'s Profile`;
    const description = `View ${displayName}'s uploaded ringtones on TamilRing. ${user.ringtone_count || 0} ringtones uploaded.`;

    return generateMetadata({
        title,
        description,
        image: user.avatar_url || DEFAULT_IMAGE,
        url: `/user/${user.username}`,
        type: 'profile',
        noIndex: true, // Don't index user profiles for privacy
    });
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Generate optimized title (50-60 characters)
 */
export function optimizeTitle(title: string): string {
    return truncateText(title, 60);
}

/**
 * Generate optimized description (150-160 characters)
 */
export function optimizeDescription(description: string): string {
    return truncateText(description, 160);
}
