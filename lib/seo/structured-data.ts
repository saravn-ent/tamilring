/**
 * Structured Data (JSON-LD) Generation
 * Implements Schema.org markup for rich search results
 */

const SITE_NAME = 'TamilRing';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tamilring.com';

/**
 * Base Organization schema
 */
export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        sameAs: [
            // Add social media profiles here
            // 'https://twitter.com/tamilring',
            // 'https://facebook.com/tamilring',
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            availableLanguage: ['Tamil', 'English'],
        },
    };
}

/**
 * WebSite schema with search action
 */
export function generateWebSiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        description: 'Download the latest Tamil movie ringtones, devotional songs, and music',
        inLanguage: 'ta',
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };
}

/**
 * MusicRecording schema for ringtone pages
 */
export function generateMusicRecordingSchema(ringtone: {
    title: string;
    slug: string;
    movie_name?: string;
    singers?: string;
    music_director?: string;
    movie_director?: string;
    artwork_url?: string;
    duration?: number;
    created_at: string;
    likes?: number;
    downloads?: number;
}) {
    const singers = ringtone.singers?.split(',').map(s => s.trim()) || [];
    const musicDirector = ringtone.music_director?.split(',').map(s => s.trim()) || [];

    return {
        '@context': 'https://schema.org',
        '@type': 'MusicRecording',
        name: ringtone.title,
        url: `${SITE_URL}/ringtone/${ringtone.slug}`,
        description: ringtone.movie_name
            ? `${ringtone.title} ringtone from ${ringtone.movie_name}`
            : `${ringtone.title} ringtone`,
        image: ringtone.artwork_url,
        duration: ringtone.duration ? `PT${ringtone.duration}S` : undefined,
        datePublished: ringtone.created_at,
        inLanguage: 'ta',
        byArtist: singers.map(singer => ({
            '@type': 'Person',
            name: singer,
            url: `${SITE_URL}/artist/${encodeURIComponent(singer)}`,
        })),
        producer: musicDirector.map(md => ({
            '@type': 'Person',
            name: md,
            url: `${SITE_URL}/artist/${encodeURIComponent(md)}`,
        })),
        inAlbum: ringtone.movie_name ? {
            '@type': 'MusicAlbum',
            name: ringtone.movie_name,
            url: `${SITE_URL}/movie/${encodeURIComponent(ringtone.movie_name)}`,
        } : undefined,
        interactionStatistic: [
            {
                '@type': 'InteractionCounter',
                interactionType: 'https://schema.org/LikeAction',
                userInteractionCount: ringtone.likes || 0,
            },
            {
                '@type': 'InteractionCounter',
                interactionType: 'https://schema.org/DownloadAction',
                userInteractionCount: ringtone.downloads || 0,
            },
        ],
    };
}

/**
 * Movie schema for movie pages
 */
export function generateMovieSchema(movie: {
    name: string;
    poster_url?: string;
    year?: string;
    director?: string;
    music_director?: string;
    description?: string;
    ringtones?: Array<{ title: string; slug: string }>;
}) {
    const directors = movie.director?.split(',').map(d => d.trim()) || [];
    const musicDirectors = movie.music_director?.split(',').map(md => md.trim()) || [];

    return {
        '@context': 'https://schema.org',
        '@type': 'Movie',
        name: movie.name,
        url: `${SITE_URL}/movie/${encodeURIComponent(movie.name)}`,
        image: movie.poster_url,
        description: movie.description || `${movie.name} Tamil movie ringtones`,
        datePublished: movie.year,
        inLanguage: 'ta',
        director: directors.map(director => ({
            '@type': 'Person',
            name: director,
            url: `${SITE_URL}/artist/${encodeURIComponent(director)}`,
        })),
        musicBy: musicDirectors.map(md => ({
            '@type': 'Person',
            name: md,
            url: `${SITE_URL}/artist/${encodeURIComponent(md)}`,
        })),
        track: movie.ringtones?.map(ringtone => ({
            '@type': 'MusicRecording',
            name: ringtone.title,
            url: `${SITE_URL}/ringtone/${ringtone.slug}`,
        })),
    };
}

/**
 * Person schema for artist pages
 */
export function generatePersonSchema(artist: {
    name: string;
    image_url?: string;
    role?: 'singer' | 'music_director' | 'movie_director';
    description?: string;
    ringtone_count?: number;
}) {
    const jobTitle = artist.role === 'singer'
        ? 'Playback Singer'
        : artist.role === 'music_director'
            ? 'Music Director'
            : 'Film Director';

    return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: artist.name,
        url: `${SITE_URL}/artist/${encodeURIComponent(artist.name)}`,
        image: artist.image_url,
        description: artist.description || `Tamil ${jobTitle}`,
        jobTitle,
        worksFor: {
            '@type': 'Organization',
            name: 'Tamil Film Industry',
        },
    };
}

/**
 * BreadcrumbList schema for navigation
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
        })),
    };
}

/**
 * ItemList schema for collections (trending, top ringtones, etc.)
 */
export function generateItemListSchema(data: {
    name: string;
    description?: string;
    items: Array<{
        title: string;
        slug: string;
        artwork_url?: string;
    }>;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: data.name,
        description: data.description,
        numberOfItems: data.items.length,
        itemListElement: data.items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
                '@type': 'MusicRecording',
                name: item.title,
                url: `${SITE_URL}/ringtone/${item.slug}`,
                image: item.artwork_url,
            },
        })),
    };
}

/**
 * CollectionPage schema for movie/artist pages with ringtone lists
 */
export function generateCollectionPageSchema(data: {
    name: string;
    description: string;
    url: string;
    numberOfItems: number;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: data.name,
        description: data.description,
        url: data.url.startsWith('http') ? data.url : `${SITE_URL}${data.url}`,
        mainEntity: {
            '@type': 'ItemList',
            numberOfItems: data.numberOfItems,
        },
    };
}

/**
 * FAQPage schema (can be used for help/about pages)
 */
export function generateFAQPageSchema(faqs: Array<{ question: string; answer: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
}

/**
 * Helper to combine multiple schemas
 */
export function combineSchemas(...schemas: any[]) {
    return {
        '@context': 'https://schema.org',
        '@graph': schemas,
    };
}

/**
 * Serialize schema to JSON-LD script tag
 */
export function serializeSchema(schema: any): string {
    return JSON.stringify(schema, null, 0);
}
