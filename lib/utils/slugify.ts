import { transliterate, slugify as transliterateSlugify } from 'transliteration';

/**
 * Advanced slugification utilities
 * Handles Tamil text, special characters, and ensures URL-safe slugs
 */

/**
 * Tamil to English transliteration map for common words
 * Helps maintain consistency in slug generation
 */
const TAMIL_TRANSLITERATION_MAP: Record<string, string> = {
    // Common Tamil words
    'பாடல்': 'paadal',
    'பட': 'padam',
    'திரைப்படம்': 'movie',
    'இசை': 'music',
    'பாடகர்': 'singer',
    'இயக்குனர்': 'director',
    // Add more as needed
};

/**
 * Generate URL-safe slug from text
 * Handles Tamil characters, special characters, and ensures uniqueness
 */
export function generateSlug(text: string, options?: {
    maxLength?: number;
    lowercase?: boolean;
    separator?: string;
}): string {
    const {
        maxLength = 100,
        lowercase = true,
        separator = '-',
    } = options || {};

    if (!text || text.trim() === '') {
        return '';
    }

    // First, try to transliterate Tamil text to English
    let slug = transliterate(text, {
        unknown: '', // Remove unknown characters
        replace: TAMIL_TRANSLITERATION_MAP,
    });

    // Use transliteration's slugify for URL-safe conversion
    slug = transliterateSlugify(slug, {
        lowercase,
        separator,
        allowedChars: 'a-zA-Z0-9',
    });

    // Remove any remaining special characters
    slug = slug
        .replace(/[^a-z0-9-]/gi, separator)
        .replace(new RegExp(`${separator}+`, 'g'), separator)
        .replace(new RegExp(`^${separator}|${separator}$`, 'g'), '');

    // Truncate to max length
    if (slug.length > maxLength) {
        slug = slug.substring(0, maxLength);
        // Remove trailing separator if truncation created one
        slug = slug.replace(new RegExp(`${separator}$`), '');
    }

    return slug;
}

/**
 * Generate slug for ringtone
 * Format: {title}-{movie}-ringtone
 */
export function generateRingtoneSlug(data: {
    title: string;
    movie_name?: string;
    singers?: string;
}): string {
    const parts: string[] = [];

    // Add title
    if (data.title) {
        parts.push(generateSlug(data.title, { maxLength: 50 }));
    }

    // Add movie name if available
    if (data.movie_name) {
        parts.push(generateSlug(data.movie_name, { maxLength: 30 }));
    }

    // Add 'ringtone' suffix
    parts.push('ringtone');

    return parts.filter(Boolean).join('-');
}

/**
 * Generate slug for movie
 * Format: {movie-name}
 */
export function generateMovieSlug(movieName: string): string {
    return generateSlug(movieName, { maxLength: 80 });
}

/**
 * Generate slug for artist
 * Format: {artist-name}
 */
export function generateArtistSlug(artistName: string): string {
    return generateSlug(artistName, { maxLength: 60 });
}

/**
 * Generate unique slug by appending number if duplicate exists
 */
export function generateUniqueSlug(
    baseSlug: string,
    existingSlugChecker: (slug: string) => Promise<boolean>,
    maxAttempts: number = 100
): Promise<string> {
    return new Promise(async (resolve, reject) => {
        let slug = baseSlug;
        let attempt = 1;

        while (attempt <= maxAttempts) {
            const exists = await existingSlugChecker(slug);

            if (!exists) {
                resolve(slug);
                return;
            }

            // Append number to make it unique
            slug = `${baseSlug}-${attempt}`;
            attempt++;
        }

        reject(new Error(`Could not generate unique slug after ${maxAttempts} attempts`));
    });
}

/**
 * Validate slug format
 */
export function isValidSlug(slug: string): boolean {
    // Slug should only contain lowercase letters, numbers, and hyphens
    // Should not start or end with hyphen
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
}

/**
 * Sanitize slug (remove invalid characters)
 */
export function sanitizeSlug(slug: string): string {
    return slug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Extract words from slug
 */
export function slugToWords(slug: string): string {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Compare two slugs for similarity
 */
export function areSimilarSlugs(slug1: string, slug2: string): boolean {
    const normalize = (s: string) => s.toLowerCase().replace(/-/g, '');
    return normalize(slug1) === normalize(slug2);
}

/**
 * Generate slug variations for search/matching
 */
export function generateSlugVariations(text: string): string[] {
    const variations = new Set<string>();

    // Original slug
    const originalSlug = generateSlug(text);
    variations.add(originalSlug);

    // Without special words
    const withoutSpecialWords = text
        .replace(/ringtone|song|music|tamil/gi, '')
        .trim();
    if (withoutSpecialWords) {
        variations.add(generateSlug(withoutSpecialWords));
    }

    // Compact version (no separators)
    variations.add(originalSlug.replace(/-/g, ''));

    return Array.from(variations).filter(Boolean);
}

/**
 * Migrate old slug to new slug format
 * Returns object with old and new slugs for redirect mapping
 */
export function migrateSlug(oldSlug: string, newData: {
    title: string;
    movie_name?: string;
    singers?: string;
}): { oldSlug: string; newSlug: string; needsMigration: boolean } {
    const newSlug = generateRingtoneSlug(newData);
    const needsMigration = oldSlug !== newSlug && !areSimilarSlugs(oldSlug, newSlug);

    return {
        oldSlug,
        newSlug,
        needsMigration,
    };
}
