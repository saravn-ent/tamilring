/**
 * Detects if a string contains more Tamil characters than English/Latin characters.
 * Useful for switching TTS voices and UI templates.
 */
export function detectLanguage(text: string): string {
    if (!text) return 'ta'; // Default to Tamil

    const counts: Record<string, number> = {
        ta: 0,
        hi: 0,
        te: 0,
        kn: 0,
        ml: 0,
        en: 0
    };

    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);

        // Tamil: U+0B80 to U+0BFF
        if (charCode >= 0x0B80 && charCode <= 0x0BFF) counts.ta++;
        // Devanagari (Hindi): U+0900 to U+097F
        else if (charCode >= 0x0900 && charCode <= 0x097F) counts.hi++;
        // Telugu: U+0C00 to U+0C7F
        else if (charCode >= 0x0C00 && charCode <= 0x0C7F) counts.te++;
        // Kannada: U+0C80 to U+0CFF
        else if (charCode >= 0x0C80 && charCode <= 0x0CFF) counts.kn++;
        // Malayalam: U+0D00 to U+0D7F
        else if (charCode >= 0x0D00 && charCode <= 0x0D7F) counts.ml++;
        // Bengali: U+0980 to U+09FF
        else if (charCode >= 0x0980 && charCode <= 0x09FF) counts.bn++;
        // Gujarati: U+0A80 to U+0AFF
        else if (charCode >= 0x0A80 && charCode <= 0x0AFF) counts.gu++;
        // Gurmukhi (Punjabi): U+0A00 to U+0A7F
        else if (charCode >= 0x0A00 && charCode <= 0x0A7F) counts.pa++;
        // Basic Latin (English)
        else if (charCode >= 0x0000 && charCode <= 0x007F && /[a-zA-Z]/.test(text[i])) counts.en++;
    }

    // Find language with highest count
    let maxLang = 'en';
    let maxCount = 0;

    for (const [lang, count] of Object.entries(counts)) {
        if (count > maxCount) {
            maxCount = count;
            maxLang = lang;
        }
    }

    // If no non-english characters found, return 'en'
    if (maxCount === 0) return 'en';

    return maxLang;
}
