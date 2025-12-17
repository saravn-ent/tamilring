/**
 * Input Sanitization Utilities
 * Prevents SQL Injection and XSS attacks
 */

/**
 * Sanitize user input for SQL ILIKE queries
 * Escapes SQL wildcards and limits length
 */
export function sanitizeSQLInput(input: string): string {
    if (!input) return '';

    return input
        // Remove null bytes
        .replace(/\0/g, '')
        // Escape SQL wildcards (%, _)
        .replace(/[%_]/g, '\\$&')
        // Remove potential SQL injection chars
        .replace(/[;'"\\]/g, '')
        // Trim whitespace
        .trim()
        // Limit length to prevent DoS
        .substring(0, 100);
}

/**
 * Sanitize search query for safe database queries
 * More permissive than sanitizeSQLInput but still safe
 */
export function sanitizeSearchQuery(query: string): string {
    if (!query) return '';

    return query
        // Remove null bytes
        .replace(/\0/g, '')
        // Escape SQL wildcards
        .replace(/[%_]/g, '\\$&')
        // Remove dangerous SQL keywords
        .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi, '')
        // Trim and limit
        .trim()
        .substring(0, 200);
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_') // Remove special chars
        .replace(/\.\./g, '_')             // Prevent path traversal
        .replace(/^\.+/, '')               // Remove leading dots
        .substring(0, 100);                // Limit length
}

/**
 * Sanitize HTML to prevent XSS
 * Note: React already escapes by default, but this is for extra safety
 */
export function sanitizeHTML(html: string): string {
    if (!html) return '';

    return html
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize URL
 */
export function sanitizeURL(url: string): string {
    try {
        const parsed = new URL(url);
        // Only allow http and https
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return '';
        }
        return parsed.toString();
    } catch {
        return '';
    }
}

/**
 * Sanitize user profile data
 */
export function sanitizeProfileData(data: {
    username?: string;
    bio?: string;
    website?: string;
}): typeof data {
    return {
        username: data.username ? sanitizeSQLInput(data.username) : undefined,
        bio: data.bio ? sanitizeHTML(data.bio).substring(0, 500) : undefined,
        website: data.website ? sanitizeURL(data.website) : undefined,
    };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
}

/**
 * Sanitize and validate sort parameter
 */
export function sanitizeSortParam(sort: string | null): string {
    const allowedSorts = ['recent', 'downloads', 'likes', 'year_desc', 'year_asc'];
    return sort && allowedSorts.includes(sort) ? sort : 'recent';
}

/**
 * Rate limit key generator (for Redis/Upstash)
 */
export function getRateLimitKey(userId: string, action: string): string {
    return `ratelimit:${sanitizeSQLInput(userId)}:${action}`;
}

/**
 * Validate and sanitize pagination params
 */
export function sanitizePaginationParams(params: {
    page?: string | number;
    limit?: string | number;
}): { page: number; limit: number } {
    const page = Math.max(1, Math.min(100, parseInt(String(params.page || 1))));
    const limit = Math.max(1, Math.min(100, parseInt(String(params.limit || 20))));

    return { page, limit };
}

/**
 * Sanitize tag array
 */
export function sanitizeTags(tags: string[]): string[] {
    const allowedTags = [
        'Love', 'Sad', 'Mass', 'BGM', 'Motivational', 'Devotional', 'Funny',
        'Vocal', 'Instrumental', 'Interlude', 'Humming', 'Dialogue', 'Remix', '8D Audio',
        'Male', 'Female', 'Duet',
        'Flute', 'Violin', 'Guitar', 'Piano', 'Keyboard', 'Veena', 'Drums', 'Nadaswaram'
    ];

    return tags
        .filter(tag => allowedTags.includes(tag))
        .slice(0, 10); // Max 10 tags
}

/**
 * Sanitize slug for URL safety
 */
export function sanitizeSlug(slug: string): string {
    return slug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
        .substring(0, 200);
}
