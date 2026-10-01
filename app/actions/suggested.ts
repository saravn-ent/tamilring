'use server';

import {
    getArtistSuggestions,
    ArtistRole,
    ArtistSuggestionsResult
} from '@/lib/server/suggestedArtists';

export async function fetchArtistSuggestions(
    artistName: string,
    role: ArtistRole,
    currentMovie: string
): Promise<ArtistSuggestionsResult> {
    return await getArtistSuggestions(artistName, role, currentMovie);
}
