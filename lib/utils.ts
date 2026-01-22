import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Splits a string containing multiple artist names separated by commas, ampersands, or "and".
 * Returns an array of trimmed artist names.
 * 
 * @param artistString - String containing one or more artist names
 * @returns Array of individual artist names
 * 
 * @example
 * splitArtists("Ilaiyaraaja & Bela Shende") // ["Ilaiyaraaja", "Bela Shende"]
 * splitArtists("A.R. Rahman, Shreya Ghoshal & Hariharan") // ["A.R. Rahman", "Shreya Ghoshal", "Hariharan"]
 */
export function splitArtists(artistString: string): string[] {
    if (!artistString) return [];

    // Split by comma, ampersand, or the word "and" (case insensitive)
    // Using regex to handle multiple separators
    return artistString
        .split(/[,&]|\band\b/i)
        .map(artist => artist.trim())
        .filter(artist => artist.length > 0);
}

/**
 * Formats a count number to a human-readable string (e.g., 1200 -> "1.2k")
 * 
 * @param num - Number to format
 * @returns Formatted string
 */
export function formatCount(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

/**
 * Generates initials from a name (first 2 characters, uppercase)
 * 
 * @param name - Name to generate initials from
 * @returns Initials (2 characters, uppercase)
 */
export function getInitials(name: string): string {
    return name ? name.substring(0, 2).toUpperCase() : 'TR';
}
/**
 * Generates a fuzzy ILIKE pattern for better transliteration matching (e.g., varanam -> v%r%n%m).
 * This handles common Tamil transliteration variations like a vs aa, i vs ee, etc.
 * 
 * @param query - The search query
 * @returns A fuzzy pattern string
 */
export function fuzzySearchPattern(query: string): string {
    if (!query) return '';

    // 1. Lowercase and trim
    const clean = query.toLowerCase().trim();

    // 2. Replace all vowels with wildcard %
    // We also collapse multiple wildcards for efficiency
    let fuzzy = clean.replace(/[aeiou]/g, '%').replace(/%+/g, '%');

    // 3. Optional: If the string doesn't start/end with %, add them for broader matching
    if (!fuzzy.startsWith('%')) fuzzy = '%' + fuzzy;
    if (!fuzzy.endsWith('%')) fuzzy = fuzzy + '%';

    return fuzzy;
}
