/**
 * Transliterates English/Latin text to Indic scripts using Google Input Tools API.
 * Example: "dei" -> "டேய்" (ta)
 * Example: "namaste" -> "नमस्ते" (hi)
 */
export async function transliterate(text: string, lang: string): Promise<string> {
    if (!text.trim() || lang === 'en') return text;

    const imeMap: Record<string, string> = {
        ta: 'transliteration_en_ta',
        hi: 'transliteration_en_hi',
        ml: 'transliteration_en_ml',
        te: 'transliteration_en_te',
        kn: 'transliteration_en_kn',
        mr: 'transliteration_en_mr',
        gu: 'transliteration_en_gu',
        pa: 'transliteration_en_pa',
        bn: 'transliteration_en_bn',
        or: 'transliteration_en_or'
    };

    const ime = imeMap[lang];
    if (!ime) return text;

    try {
        const url = `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&ime=${ime}&num=1`;

        const response = await fetch(url);
        const data = await response.json();

        if (data && data[0] === 'SUCCESS') {
            const results = data[1];
            if (results && results[0] && results[0][1] && results[0][1][0]) {
                return results[0][1][0];
            }
        }
        return text;
    } catch (error) {
        console.error('Transliteration error:', error);
        return text;
    }
}
