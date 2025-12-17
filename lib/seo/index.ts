/**
 * SEO Module
 * Centralized SEO utilities for TamilRing
 */

// Metadata generation
export {
    generateBaseMetadata,
    generateMetadata,
    generateHomeMetadata,
    generateRingtoneMetadata,
    generateMovieMetadata,
    generateArtistMetadata,
    generateSearchMetadata,
    generateUserProfileMetadata,
    truncateText,
    optimizeTitle,
    optimizeDescription,
} from './metadata';

// Structured data (JSON-LD)
export {
    generateOrganizationSchema,
    generateWebSiteSchema,
    generateMusicRecordingSchema,
    generateMovieSchema,
    generatePersonSchema,
    generateBreadcrumbSchema,
    generateItemListSchema,
    generateCollectionPageSchema,
    generateFAQPageSchema,
    combineSchemas,
    serializeSchema,
} from './structured-data';

// Type exports
export type { SEOConfig } from './metadata';
