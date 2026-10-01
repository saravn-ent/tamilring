import { supabase } from '@/lib/supabaseClient';
import { unstable_cache } from 'next/cache';
import { Ringtone } from '@/types';

export type ArtistRole = 'Music Director' | 'Director' | 'Starring' | 'Singer' | 'Lyricist';

export interface MovieArtist {
    name: string;
    role: ArtistRole;
}

export interface SuggestedMovie {
    movie_name: string;
    poster_url: string;
    movie_year: string;
    ringtone_count: number;
    music_director?: string | null;
}

export type ArtistSuggestionsResult =
    | { type: 'movies'; data: SuggestedMovie[]; artist: MovieArtist }
    | { type: 'ringtones'; data: Ringtone[]; artist: MovieArtist };

/**
 * Parses raw artist names from strings containing commas, ampersands, or "feat/ft"
 */
function parseArtistNames(raw: string | null | undefined): string[] {
    if (!raw) return [];
    return raw
        .split(/[,&/|]|\band\b|\bfeat\b\.?|\bft\b\.?/i)
        .map(s => s.trim())
        .filter(s => s.length > 1 && !/^(unknown|various|null|undefined)$/i.test(s));
}

/**
 * Extracts all distinct artists categorized by role for a given movie/album.
 * Includes every artist even if they only appear on 1 track.
 */
export const getMovieArtists = unstable_cache(
    async (movieName: string): Promise<MovieArtist[]> => {
        if (!movieName) return [];

        const { data } = await supabase
            .from('ringtones')
            .select('music_director, movie_director, cast_members, singers, lyricist')
            .eq('status', 'approved')
            .eq('movie_name', movieName);

        if (!data || data.length === 0) return [];

        const roleMap = new Map<string, MovieArtist>();

        for (const r of data) {
            parseArtistNames(r.music_director).forEach(name => {
                const key = `Music Director:${name.toLowerCase()}`;
                if (!roleMap.has(key)) {
                    roleMap.set(key, { name, role: 'Music Director' });
                }
            });

            parseArtistNames(r.movie_director).forEach(name => {
                const key = `Director:${name.toLowerCase()}`;
                if (!roleMap.has(key)) {
                    roleMap.set(key, { name, role: 'Director' });
                }
            });

            parseArtistNames(r.cast_members).forEach(name => {
                const key = `Starring:${name.toLowerCase()}`;
                if (!roleMap.has(key)) {
                    roleMap.set(key, { name, role: 'Starring' });
                }
            });

            parseArtistNames(r.singers).forEach(name => {
                const key = `Singer:${name.toLowerCase()}`;
                if (!roleMap.has(key)) {
                    roleMap.set(key, { name, role: 'Singer' });
                }
            });

            parseArtistNames(r.lyricist).forEach(name => {
                const key = `Lyricist:${name.toLowerCase()}`;
                if (!roleMap.has(key)) {
                    roleMap.set(key, { name, role: 'Lyricist' });
                }
            });
        }

        // Return ordered: Music Directors first, Directors, Starring, Singers, Lyricists
        const roleOrder: Record<ArtistRole, number> = {
            'Music Director': 1,
            'Director': 2,
            'Starring': 3,
            'Singer': 4,
            'Lyricist': 5,
        };

        return Array.from(roleMap.values()).sort((a, b) => {
            const diff = roleOrder[a.role] - roleOrder[b.role];
            if (diff !== 0) return diff;
            return a.name.localeCompare(b.name);
        });
    },
    ['movie-artists-list-v1'],
    { revalidate: 3600, tags: ['movies', 'artists'] }
);

/**
 * Retrieves movie album suggestions for Music Directors, Directors, or Actors.
 */
export const getArtistMovieSuggestions = unstable_cache(
    async (artistName: string, role: ArtistRole, currentMovie: string): Promise<SuggestedMovie[]> => {
        let column = 'music_director';
        if (role === 'Director') column = 'movie_director';
        if (role === 'Starring') column = 'cast_members';

        const { data: rawTracks } = await supabase
            .from('ringtones')
            .select('movie_name, poster_url, movie_year, music_director, downloads, likes')
            .eq('status', 'approved')
            .ilike(column, `%${artistName.trim()}%`)
            .not('poster_url', 'is', null)
            .neq('poster_url', '')
            .limit(100);

        const movieMap = new Map<string, SuggestedMovie & { score: number }>();
        const currentMovieEntries: SuggestedMovie[] = [];

        if (rawTracks && rawTracks.length > 0) {
            for (const r of rawTracks) {
                if (!r.movie_name) continue;
                const isCurrent = r.movie_name.toLowerCase() === currentMovie.toLowerCase();

                if (movieMap.has(r.movie_name)) {
                    const item = movieMap.get(r.movie_name)!;
                    item.ringtone_count++;
                    item.score += 10 + (r.downloads || 0);
                } else {
                    const entry: SuggestedMovie & { score: number } = {
                        movie_name: r.movie_name,
                        poster_url: r.poster_url,
                        movie_year: r.movie_year || '',
                        music_director: r.music_director || null,
                        ringtone_count: 1,
                        score: (isCurrent ? 0 : 50) + (r.downloads || 0),
                    };

                    if (isCurrent) {
                        currentMovieEntries.push(entry);
                    } else {
                        movieMap.set(r.movie_name, entry);
                    }
                }
            }
        }

        // If artist only has current movie, include current movie so data isn't empty!
        if (movieMap.size === 0 && currentMovieEntries.length > 0) {
            currentMovieEntries.forEach(m => movieMap.set(m.movie_name, { ...m, score: 100 }));
        }

        // If we still have fewer than 4 movies (for MD or Director), backfill with top movies
        if (movieMap.size < 4 && (role === 'Music Director' || role === 'Director')) {
            const { data: popular } = await supabase
                .from('ringtones')
                .select('movie_name, poster_url, movie_year, music_director, downloads')
                .eq('status', 'approved')
                .neq('movie_name', currentMovie)
                .not('poster_url', 'is', null)
                .neq('poster_url', '')
                .order('downloads', { ascending: false })
                .limit(40);

            if (popular) {
                for (const r of popular) {
                    if (!r.movie_name || movieMap.has(r.movie_name) || r.movie_name.toLowerCase() === currentMovie.toLowerCase()) continue;
                    movieMap.set(r.movie_name, {
                        movie_name: r.movie_name,
                        poster_url: r.poster_url,
                        movie_year: r.movie_year || '',
                        music_director: r.music_director || null,
                        ringtone_count: 1,
                        score: r.downloads || 0,
                    });
                    if (movieMap.size >= 8) break;
                }
            }
        }

        return Array.from(movieMap.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map(({ movie_name, poster_url, movie_year, ringtone_count, music_director }) => ({
                movie_name,
                poster_url,
                movie_year,
                ringtone_count,
                music_director,
            }));
    },
    ['artist-movie-suggestions-v1'],
    { revalidate: 3600, tags: ['movies', 'suggestions'] }
);

/**
 * Retrieves ringtone track suggestions for Singers and Lyricists.
 * Returns up to 10 top ringtones, even if the artist has only 1 track.
 */
export const getArtistRingtoneSuggestions = unstable_cache(
    async (artistName: string, role: ArtistRole): Promise<Ringtone[]> => {
        const column = role === 'Lyricist' ? 'lyricist' : 'singers';

        const { data } = await supabase
            .from('ringtones')
            .select('id, title, song_name, slug, movie_name, movie_year, audio_url, duration, poster_url, backdrop_url, downloads, likes, singers, music_director, movie_director, tags, created_at')
            .eq('status', 'approved')
            .ilike(column, `%${artistName.trim()}%`)
            .order('downloads', { ascending: false })
            .limit(10);

        return (data || []) as Ringtone[];
    },
    ['artist-ringtone-suggestions-v1'],
    { revalidate: 3600, tags: ['ringtones', 'suggestions'] }
);

/**
 * Unified selector for artist suggestions.
 * Returns either movies (for Directors, Composers, Actors) or ringtones (for Singers, Lyricists).
 */
export async function getArtistSuggestions(
    artistName: string,
    role: ArtistRole,
    currentMovie: string
): Promise<ArtistSuggestionsResult> {
    if (role === 'Singer' || role === 'Lyricist') {
        const data = await getArtistRingtoneSuggestions(artistName, role);
        return {
            type: 'ringtones',
            data,
            artist: { name: artistName, role },
        };
    }

    const data = await getArtistMovieSuggestions(artistName, role, currentMovie);
    return {
        type: 'movies',
        data,
        artist: { name: artistName, role },
    };
}
