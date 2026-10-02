/**
 * Structured Data (JSON-LD) Generation
 * Implements Schema.org markup for rich search results
 */

const SITE_NAME = 'TamilRing';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tamilring.in';

/**
 * Base Organization schema
 */
export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/og-image.png`,
        sameAs: [
            'https://www.instagram.com/tamilring.in',
            'https://www.youtube.com/@tamilring',
            'https://t.me/tamilrings',
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            availableLanguage: ['English', 'Tamil'],
        },
    };
}

/**
 * Base WebSite schema (SearchAction / Sitelinks Searchbox intentionally omitted)
 */
export function generateWebSiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        description: 'Download the latest Tamil movie ringtones, BGM, and devotional songs. High-quality Tamil cinema audio for Android and iPhone.',
        inLanguage: ['en', 'ta'],
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
    audio_url?: string;
    duration?: number;
    created_at: string;
    likes?: number;
    downloads?: number;
}) {
    const singers = ringtone.singers?.split(',').map(s => s.trim()) || [];
    const musicDirector = ringtone.music_director?.split(',').map(s => s.trim()) || [];

    const singerList = ringtone.singers?.trim();
    const mdList = ringtone.music_director?.trim();
    const artistCredits = singerList
        ? ` sung by ${singerList}${mdList ? `, Music by ${mdList}` : ''}`
        : mdList ? ` Music by ${mdList}` : '';

    return {
        '@context': 'https://schema.org',
        '@type': 'MusicRecording',
        name: ringtone.title,
        url: `${SITE_URL}/ringtone/${ringtone.slug}`,
        description: ringtone.movie_name
            ? `${ringtone.title} Tamil ringtone from ${ringtone.movie_name}${artistCredits}. Free download for Android (MP3) and iPhone (M4R).`
            : `${ringtone.title} Tamil ringtone${artistCredits}. Free download for Android and iPhone.`,
        image: ringtone.artwork_url,
        duration: ringtone.duration ? `PT${ringtone.duration}S` : undefined,
        datePublished: ringtone.created_at,
        inLanguage: 'ta', // Tamil
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
        // AudioObject — helps AI engines (Perplexity, Gemini, ChatGPT) understand the audio file
        audio: ringtone.audio_url ? {
            '@type': 'AudioObject',
            contentUrl: ringtone.audio_url,
            encodingFormat: 'audio/mpeg',
            duration: ringtone.duration ? `PT${ringtone.duration}S` : undefined,
            name: `${ringtone.title} Ringtone`,
            description: ringtone.movie_name
                ? `${ringtone.title} Tamil audio ringtone from ${ringtone.movie_name}${artistCredits}. Free MP3 & M4R audio cut.`
                : `${ringtone.title} Tamil audio ringtone${artistCredits}. Free MP3 & M4R audio cut.`,
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
        // AggregateRating — can trigger star ratings in Google SERPs for MusicRecording
        // Only include when we have meaningful likes data (≥3 likes)
        ...(ringtone.likes && ringtone.likes >= 3 ? {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.5',
                bestRating: '5',
                worstRating: '1',
                ratingCount: ringtone.likes,
            },
        } : {}),
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
    cast?: string;
    description?: string;
    ringtones?: Array<{ title: string; slug: string; artwork_url?: string }>;
}) {
    const directors = movie.director?.split(',').map(d => d.trim()).filter(Boolean) || [];
    const musicDirectors = movie.music_director?.split(',').map(md => md.trim()).filter(Boolean) || [];
    const actors = movie.cast?.split(',').map(a => a.trim()).filter(Boolean) || [];

    return {
        '@context': 'https://schema.org',
        '@type': 'Movie',
        name: movie.name,
        url: `${SITE_URL}/movie/${encodeURIComponent(movie.name)}`,
        image: movie.poster_url,
        description: movie.description || `Download ${movie.name} Tamil movie ringtones. Free BGM and song ringtones for Android and iPhone.`,
        datePublished: movie.year,
        inLanguage: 'ta', // Tamil
        ...(directors.length > 0 ? {
            director: directors.length === 1
                ? {
                    '@type': 'Person',
                    name: directors[0],
                    url: `${SITE_URL}/artist/${encodeURIComponent(directors[0])}`,
                }
                : directors.map(director => ({
                    '@type': 'Person',
                    name: director,
                    url: `${SITE_URL}/artist/${encodeURIComponent(director)}`,
                })),
        } : {}),
        ...(musicDirectors.length > 0 ? {
            musicBy: musicDirectors.length === 1
                ? {
                    '@type': 'Person',
                    name: musicDirectors[0],
                    url: `${SITE_URL}/artist/${encodeURIComponent(musicDirectors[0])}`,
                }
                : musicDirectors.map(md => ({
                    '@type': 'Person',
                    name: md,
                    url: `${SITE_URL}/artist/${encodeURIComponent(md)}`,
                })),
        } : {}),
        ...(actors.length > 0 ? {
            actor: actors.map(actor => ({
                '@type': 'Person',
                name: actor,
                url: `${SITE_URL}/actor/${encodeURIComponent(actor)}`,
            })),
        } : {}),
        track: movie.ringtones?.map(ringtone => ({
            '@type': 'MusicRecording',
            name: ringtone.title,
            url: `${SITE_URL}/ringtone/${ringtone.slug}`,
            image: ringtone.artwork_url || movie.poster_url,
        })),
    };
}

/**
 * MusicAlbum schema for movie album pages
 */
export function generateMusicAlbumSchema(album: {
    name: string;
    poster_url?: string;
    year?: string;
    music_director?: string;
    ringtones?: Array<{ title: string; slug: string; duration?: number; artwork_url?: string }>;
}) {
    const musicDirectors = album.music_director?.split(',').map(md => md.trim()).filter(Boolean) || [];
    return {
        '@context': 'https://schema.org',
        '@type': 'MusicAlbum',
        name: `${album.name} (Original Soundtrack)`,
        url: `${SITE_URL}/movie/${encodeURIComponent(album.name)}`,
        image: album.poster_url,
        description: `Download ${album.name} Tamil movie songs and ringtones album${album.music_director ? ` composed by ${album.music_director}` : ''}. High-quality audio for Android and iPhone.`,
        datePublished: album.year,
        inLanguage: 'ta', // Tamil
        numTracks: album.ringtones?.length || 0,
        byArtist: musicDirectors.map(md => ({
            '@type': 'Person',
            name: md,
            url: `${SITE_URL}/artist/${encodeURIComponent(md)}`,
        })),
        track: album.ringtones?.map(r => ({
            '@type': 'MusicRecording',
            name: r.title,
            url: `${SITE_URL}/ringtone/${r.slug}`,
            image: r.artwork_url || album.poster_url,
            duration: r.duration ? `PT${r.duration}S` : undefined,
        })),
    };
}

/**
 * Person schema for artist pages
 */
export function generatePersonSchema(artist: {
    name: string;
    image_url?: string;
    role?: 'singer' | 'music_director' | 'movie_director' | 'actor' | 'lyricist';
    description?: string;
    url?: string;
}) {
    const jobTitle = artist.role === 'singer'
        ? 'Playback Singer'
        : artist.role === 'music_director'
            ? 'Music Director'
            : artist.role === 'movie_director'
                ? 'Film Director'
                : artist.role === 'actor'
                    ? 'Actor'
                    : 'Lyricist';

    const personUrl = artist.url
        ? (artist.url.startsWith('http') ? artist.url : `${SITE_URL}${artist.url}`)
        : `${SITE_URL}/artist/${encodeURIComponent(artist.name)}`;

    return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: artist.name,
        url: personUrl,
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
 * ItemList schema for movies (e.g. Now In Theaters, Latest Releases)
 */
export function generateMovieItemListSchema(data: {
    name: string;
    description?: string;
    items: Array<{
        name: string;
        year?: string;
        poster_url?: string;
        director?: string;
        music_director?: string;
    }>;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: data.name,
        description: data.description,
        numberOfItems: data.items.length,
        itemListElement: data.items.map((item, index) => {
            const directors = (item.director || '')
                .split(',')
                .map(d => d.trim())
                .filter(Boolean);
            const musicDirectors = (item.music_director || '')
                .split(',')
                .map(md => md.trim())
                .filter(Boolean);

            return {
                '@type': 'ListItem',
                position: index + 1,
                item: {
                    '@type': 'Movie',
                    name: item.name,
                    url: `${SITE_URL}/movie/${encodeURIComponent(item.name)}`,
                    image: item.poster_url,
                    datePublished: item.year,
                    inLanguage: 'ta',
                    ...(directors.length > 0 ? {
                        director: directors.length === 1
                            ? {
                                '@type': 'Person',
                                name: directors[0],
                                url: `${SITE_URL}/artist/${encodeURIComponent(directors[0])}`,
                            }
                            : directors.map(director => ({
                                '@type': 'Person',
                                name: director,
                                url: `${SITE_URL}/artist/${encodeURIComponent(director)}`,
                            })),
                    } : {}),
                    ...(musicDirectors.length > 0 ? {
                        musicBy: musicDirectors.length === 1
                            ? {
                                '@type': 'Person',
                                name: musicDirectors[0],
                                url: `${SITE_URL}/artist/${encodeURIComponent(musicDirectors[0])}`,
                            }
                            : musicDirectors.map(md => ({
                                '@type': 'Person',
                                name: md,
                                url: `${SITE_URL}/artist/${encodeURIComponent(md)}`,
                            })),
                    } : {}),
                },
            };
        }),
    };
}

/**
 * ItemList schema for artists/composers (e.g. Hall of Maestros, Top Singers)
 */
export function generateArtistItemListSchema(data: {
    name: string;
    description?: string;
    items: Array<{
        name: string;
        image?: string;
        role?: string;
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
                '@type': 'Person',
                name: item.name,
                url: `${SITE_URL}/artist/${encodeURIComponent(item.name)}`,
                image: item.image,
                jobTitle: item.role || 'Music Director',
                worksFor: {
                    '@type': 'Organization',
                    name: 'Tamil Film Industry',
                },
            },
        })),
    };
}

/**
 * ItemList schema for collections/hubs (e.g. Deities, Mood Stations, Eras)
 */
export function generateCollectionItemListSchema(data: {
    name: string;
    description?: string;
    items: Array<{
        name: string;
        description?: string;
        url: string;
        image?: string;
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
                '@type': 'CollectionPage',
                name: item.name,
                description: item.description,
                url: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
                image: item.image,
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
export function combineSchemas(...schemas: Record<string, unknown>[]) {
    return {
        '@context': 'https://schema.org',
        '@graph': schemas,
    };
}

/**
 * Serialize schema to JSON-LD script tag
 */
export function serializeSchema(schema: Record<string, unknown>): string {
    return JSON.stringify(schema, null, 0);
}
