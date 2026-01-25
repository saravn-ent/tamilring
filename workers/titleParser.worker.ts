// Title Parser Web Worker
// Runs in background thread - doesn't block UI

interface ParseRequest {
    id: string;
    title: string;
    songName?: string;
    movieName?: string;
}

interface ParseResponse {
    id: string;
    displayName: string;
}

// Memoization cache (persists in worker memory)
const titleCache = new Map<string, string>();

function parseRingtoneTitle(
    title: string,
    songName?: string,
    movieName?: string
): string {
    const cacheKey = `${title}|${songName}|${movieName}`;

    if (titleCache.has(cacheKey)) {
        return titleCache.get(cacheKey)!;
    }

    const song = songName?.trim() || '';
    const movie = movieName?.trim() || '';

    // Similarity Check
    const isSimilar = (a: string, b: string) => {
        if (!a || !b) return false;
        const s1 = a.toLowerCase();
        const s2 = b.toLowerCase();
        return s1 === s2 || s1.includes(s2) || s2.includes(s1) ||
            (s1.length >= 4 && s2.length >= 4 && s1.substring(0, 4) === s2.substring(0, 4));
    };

    // Extract unique segment
    const titleWords = title.split(/[\s\-–—:|]+/);
    const segmentWords = titleWords.filter(word => {
        const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '');
        if (cleanWord.length < 2) return false;
        if (isSimilar(cleanWord, movie)) return false;
        if (isSimilar(cleanWord, song)) return false;
        if (/^(from|movie|song|ringtone|mp3|download|tamil|official|by|for|with|in)$/i.test(cleanWord)) return false;
        return true;
    });

    const uniqueSegment = segmentWords.join(' ');

    // Build final title
    let displayName: string;
    if (uniqueSegment && song) {
        displayName = `${uniqueSegment} - ${song}`;
    } else if (song) {
        displayName = song;
    } else if (uniqueSegment && movie) {
        displayName = `${uniqueSegment} - ${movie}`;
    } else {
        displayName = movie || title;
    }

    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

    titleCache.set(cacheKey, displayName);
    return displayName;
}

// Listen for messages from main thread
self.onmessage = (e: MessageEvent<ParseRequest>) => {
    const { id, title, songName, movieName } = e.data;

    const displayName = parseRingtoneTitle(title, songName, movieName);

    const response: ParseResponse = { id, displayName };
    self.postMessage(response);
};

// Export for TypeScript
export { };
