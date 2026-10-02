import { supabase } from '@/lib/supabaseClient';
import { Ringtone, SuggestionItem } from '@/types';
import { ERAS, INSTRUMENTS, MOODS } from '@/lib/constants';

export type { SuggestionItem };

export interface SearchMovie {
    movie_name: string;
    movie_year: string;
    poster_url: string;
    ringtone_count?: number;
    likes?: number;
}

export interface SearchArtist {
    name: string;
    role?: 'Composer' | 'Singer';
    avatar_url?: string;
    count?: number;
}

export interface SearchActor {
    name: string;
    count?: number;
}

export interface SearchResults {
    ringtones: Ringtone[];
    movies: SearchMovie[];
    artists: SearchArtist[];
    actors: SearchActor[];
    totalRingtones: number;
    hasMore: boolean;
    query: string;
    matchedEra?: string;
    matchedInstrument?: string;
    matchedMood?: string;
}


// Kollywood & Tamil Music aliases to dramatically improve discovery
export const TAMIL_SEARCH_ALIASES: Record<string, string[]> = {
    // Composers
    'arr': ['a.r. rahman', 'rahman'],
    'ar rahman': ['a.r. rahman'],
    'rahman': ['a.r. rahman'],
    'ani': ['anirudh', 'anirudh ravichander'],
    'anirudh': ['anirudh ravichander'],
    'u1': ['yuvan', 'yuvan shankar raja'],
    'yuvan': ['yuvan shankar raja'],
    'raja': ['ilaiyaraaja', 'ilayaraja'],
    'ilayaraja': ['ilaiyaraaja'],
    'ilaiyaraja': ['ilaiyaraaja'],
    'harris': ['harris jayaraj'],
    'hj': ['harris jayaraj'],
    'sana': ['santhosh narayanan'],
    'gvp': ['g.v. prakash', 'g. v. prakash kumar'],
    'gv prakash': ['g.v. prakash kumar'],
    'imman': ['d. imman'],
    'dsp': ['devi sri prasad'],
    'hip hop': ['hiphop tamizha'],
    'hiphop': ['hiphop tamizha'],
    'sam cs': ['sam c.s.'],
    'spb': ['s. p. balasubrahmanyam', 'balasubrahmanyam'],
    'kjy': ['k. j. yesudas', 'yesudas'],

    // Actors
    'thalaivar': ['rajinikanth'],
    'rajini': ['rajinikanth'],
    'superstar': ['rajinikanth'],
    'thalapathy': ['vijay'],
    'vj': ['vijay'],
    'thala': ['ajith', 'ajith kumar'],
    'ak': ['ajith kumar', 'ajith'],
    'kamal': ['kamal haasan'],
    'ulaganayagan': ['kamal haasan'],
    'chiyaan': ['vikram'],
    'sk': ['sivakarthikeyan'],
    'simbu': ['silambarasan', 'str'],
    'str': ['silambarasan'],
    'dhanush': ['dhanush'],
    'suriya': ['suriya'],
    'surya': ['suriya'],
    'karthi': ['karthi'],
    'vijaysethupathi': ['vijay sethupathi'],
    'vjs': ['vijay sethupathi'],
    'makkal selvan': ['vijay sethupathi'],

    // Generic keywords
    'bgm': ['bgm', 'theme', 'score', 'instrumental'],
    'mass': ['mass', 'theme', 'dialogue', 'teaser'],
    'love': ['love', 'melody', 'romantic'],
};

/**
 * Clean user search input to be safe for PostgREST while retaining alphanumeric characters and spaces.
 */
export function cleanSearchTerm(input: string): string {
    if (!input) return '';
    return input
        .replace(/[,()"'\\;%_]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Main Multi-Entity Search Engine Function
 */
export async function searchTamilRing({
    query = '',
    tab = 'all',
    sort = 'downloads',
    page = 1,
    limit = 24,
}: {
    query?: string;
    tab?: 'all' | 'ringtones' | 'movies' | 'artists' | 'actors';
    sort?: 'downloads' | 'recent' | 'likes' | 'year_desc' | 'year_asc';
    page?: number;
    limit?: number;
}): Promise<SearchResults> {
    const rawQuery = cleanSearchTerm(query);
    const lowQuery = rawQuery.toLowerCase();

    // Check for Era match (e.g. "90s", "80s", "2k20s")
    const matchedEra = ERAS.find(
        (e) => e.label.toLowerCase() === lowQuery || e.query.toLowerCase() === lowQuery
    );

    // Check for Instrument match (e.g. "flute", "violin", "guitar")
    const matchedInstrument = INSTRUMENTS.find(
        (i) => i.label.toLowerCase() === lowQuery || i.query.toLowerCase() === lowQuery
    );

    // Check for Mood match (e.g. "love", "sad", "mass", "bgm")
    const matchedMood = MOODS.find((m) => m.toLowerCase() === lowQuery);

    // Resolve aliases (e.g. "ARR" -> "A.R. Rahman", "Thalaivar" -> "Rajinikanth")
    const aliasExpansions = TAMIL_SEARCH_ALIASES[lowQuery] || [];
    const searchTerms = [rawQuery, ...aliasExpansions].filter(Boolean);

    // Build the Ringtones Query
    let dbQuery = supabase
        .from('ringtones')
        .select('*', { count: 'exact' })
        .eq('status', 'approved')
        .not('audio_url', 'is', null)
        .neq('audio_url', '');

    if (matchedEra) {
        dbQuery = dbQuery
            .gte('movie_year', matchedEra.startYear)
            .lte('movie_year', matchedEra.endYear);
    } else if (rawQuery.length > 0) {
        // Multi-field search across: title, song_name, movie_name, singers, music_director, cast_members, lyricist, mood
        // Combine all alias terms into an OR condition
        const orClauses: string[] = [];

        for (const term of searchTerms) {
            const cleanT = cleanSearchTerm(term);
            if (!cleanT) continue;

            const words = cleanT.split(/\s+/).filter((w) => w.length > 0);

            // Add full term match
            orClauses.push(
                `title.ilike.%${cleanT}%`,
                `song_name.ilike.%${cleanT}%`,
                `movie_name.ilike.%${cleanT}%`,
                `singers.ilike.%${cleanT}%`,
                `music_director.ilike.%${cleanT}%`,
                `cast_members.ilike.%${cleanT}%`,
                `lyricist.ilike.%${cleanT}%`,
                `mood.ilike.%${cleanT}%`
            );

            // If multi-word (e.g. "Leo Badass" or "Master Anirudh"), add individual word matches
            if (words.length > 1) {
                for (const word of words) {
                    if (word.length >= 3) {
                        orClauses.push(
                            `title.ilike.%${word}%`,
                            `movie_name.ilike.%${word}%`,
                            `singers.ilike.%${word}%`,
                            `music_director.ilike.%${word}%`,
                            `cast_members.ilike.%${word}%`
                        );
                    }
                }
            }
        }

        if (orClauses.length > 0) {
            // Deduplicate clauses
            const uniqueClauses = Array.from(new Set(orClauses));
            dbQuery = dbQuery.or(uniqueClauses.join(','));
        }
    }

    // Apply Sorting
    switch (sort) {
        case 'recent':
            dbQuery = dbQuery.order('created_at', { ascending: false });
            break;
        case 'likes':
            dbQuery = dbQuery.order('likes', { ascending: false });
            break;
        case 'year_desc':
            dbQuery = dbQuery.order('movie_year', { ascending: false, nullsFirst: false });
            break;
        case 'year_asc':
            dbQuery = dbQuery.order('movie_year', { ascending: true, nullsFirst: false });
            break;
        case 'downloads':
        default:
            dbQuery = dbQuery.order('downloads', { ascending: false });
            break;
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data: ringtonesData, count: totalCount, error } = await dbQuery.range(from, to);

    if (error) {
        console.error('Search query error:', error);
    }

    const ringtones: Ringtone[] = ringtonesData || [];
    const totalRingtones = totalCount || ringtones.length;
    const hasMore = from + ringtones.length < totalRingtones;

    // Extract Entities (Movies, Artists, Actors) from the current matches or dedicated query
    const moviesMap = new Map<string, SearchMovie>();
    const artistsMap = new Map<string, SearchArtist>();
    const actorsMap = new Map<string, SearchActor>();

    // Scan ringtones to aggregate entities
    ringtones.forEach((r) => {
        // Movies
        if (r.movie_name && !moviesMap.has(r.movie_name)) {
            moviesMap.set(r.movie_name, {
                movie_name: r.movie_name,
                movie_year: r.movie_year || '',
                poster_url: r.poster_url || '',
                likes: r.likes || 0,
            });
        }

        // Artists (Singers & Composers)
        if (r.music_director) {
            const md = r.music_director.trim();
            if (md && !artistsMap.has(md)) {
                artistsMap.set(md, { name: md, role: 'Composer' });
            }
        }
        if (r.singers) {
            r.singers.split(/[,&]/).forEach((s) => {
                const singer = s.trim();
                if (singer && !artistsMap.has(singer)) {
                    artistsMap.set(singer, { name: singer, role: 'Singer' });
                }
            });
        }

        // Actors
        if (r.cast_members) {
            r.cast_members.split(/[,&]/).forEach((c) => {
                const actor = c.trim();
                if (actor && !actorsMap.has(actor)) {
                    actorsMap.set(actor, { name: actor });
                }
            });
        }
    });

    // If on a specific tab with search query, fetch deeper entity matches
    if (rawQuery.length > 1 && (tab === 'movies' || tab === 'all')) {
        // Fetch up to 12 matching movies directly
        const { data: directMovies } = await supabase
            .from('ringtones')
            .select('movie_name, movie_year, poster_url, likes')
            .eq('status', 'approved')
            .not('poster_url', 'is', null)
            .neq('poster_url', '')
            .ilike('movie_name', `%${rawQuery}%`)
            .order('likes', { ascending: false })
            .limit(20);

        directMovies?.forEach((m) => {
            if (m.movie_name && !moviesMap.has(m.movie_name)) {
                moviesMap.set(m.movie_name, {
                    movie_name: m.movie_name,
                    movie_year: m.movie_year || '',
                    poster_url: m.poster_url || '',
                    likes: m.likes || 0,
                });
            }
        });
    }

    return {
        ringtones,
        movies: Array.from(moviesMap.values()),
        artists: Array.from(artistsMap.values()),
        actors: Array.from(actorsMap.values()),
        totalRingtones,
        hasMore,
        query: rawQuery,
        matchedEra: matchedEra?.label,
        matchedInstrument: matchedInstrument?.label,
        matchedMood: matchedMood,
    };
}

/**
 * Fetch default curated data for Empty / Browse state
 * Ensures tabs like Ringtones, Movies, Artists, Actors are NEVER blank!
 */
export async function getSearchDefaults() {
    // 1. Trending Ringtones
    const { data: ringtones } = await supabase
        .from('ringtones')
        .select('*')
        .eq('status', 'approved')
        .not('audio_url', 'is', null)
        .neq('audio_url', '')
        .order('downloads', { ascending: false })
        .limit(20);

    // 2. Popular Movies with Posters
    const { data: movieRows } = await supabase
        .from('ringtones')
        .select('movie_name, movie_year, poster_url, likes')
        .eq('status', 'approved')
        .not('poster_url', 'is', null)
        .neq('poster_url', '')
        .order('likes', { ascending: false })
        .limit(40);

    const moviesMap = new Map<string, SearchMovie>();
    movieRows?.forEach((m) => {
        if (m.movie_name && !moviesMap.has(m.movie_name)) {
            moviesMap.set(m.movie_name, {
                movie_name: m.movie_name,
                movie_year: m.movie_year || '',
                poster_url: m.poster_url || '',
                likes: m.likes || 0,
            });
        }
    });

    // 3. Top Artists (Composers & Singers)
    const { data: artistRows } = await supabase
        .from('ringtones')
        .select('music_director, singers')
        .eq('status', 'approved')
        .limit(100);

    const artistCounts = new Map<string, { role: 'Composer' | 'Singer'; count: number }>();
    artistRows?.forEach((r) => {
        if (r.music_director) {
            const md = r.music_director.trim();
            const curr = artistCounts.get(md) || { role: 'Composer', count: 0 };
            artistCounts.set(md, { role: 'Composer', count: curr.count + 1 });
        }
        if (r.singers) {
            r.singers.split(/[,&]/).forEach((s: string) => {
                const singer = s.trim();
                if (singer) {
                    const curr = artistCounts.get(singer) || { role: 'Singer', count: 0 };
                    artistCounts.set(singer, { role: 'Singer', count: curr.count + 1 });
                }
            });
        }
    });

    const topArtists: SearchArtist[] = Array.from(artistCounts.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 15)
        .map(([name, info]) => ({ name, role: info.role, count: info.count }));

    // 4. Top Actors
    const { data: actorRows } = await supabase
        .from('ringtones')
        .select('cast_members')
        .eq('status', 'approved')
        .not('cast_members', 'is', null)
        .limit(100);

    const actorCounts = new Map<string, number>();
    actorRows?.forEach((r) => {
        if (r.cast_members) {
            r.cast_members.split(/[,&]/).forEach((c: string) => {
                const actor = c.trim();
                if (actor) {
                    actorCounts.set(actor, (actorCounts.get(actor) || 0) + 1);
                }
            });
        }
    });

    const topActors: SearchActor[] = Array.from(actorCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([name, count]) => ({ name, count }));

    return {
        ringtones: (ringtones as Ringtone[]) || [],
        movies: Array.from(moviesMap.values()).slice(0, 18),
        artists: topArtists,
        actors: topActors,
    };
}

/**
 * Fast, lightweight autocomplete suggestions for the Desktop Menu Bar Search
 */
export async function getQuickSuggestions(query: string): Promise<SuggestionItem[]> {
    const clean = cleanSearchTerm(query);
    if (!clean || clean.length < 2) return [];

    const lowClean = clean.toLowerCase();
    const aliasExpansions = TAMIL_SEARCH_ALIASES[lowClean] || [];
    const searchTerms = [clean, ...aliasExpansions];

    const orClauses: string[] = [];
    for (const term of searchTerms) {
        orClauses.push(
            `title.ilike.%${term}%`,
            `movie_name.ilike.%${term}%`,
            `singers.ilike.%${term}%`,
            `music_director.ilike.%${term}%`,
            `cast_members.ilike.%${term}%`
        );
    }

    const { data } = await supabase
        .from('ringtones')
        .select('id, title, slug, movie_name, movie_year, poster_url, audio_url, singers, music_director, cast_members, downloads')
        .eq('status', 'approved')
        .or(orClauses.join(','))
        .order('downloads', { ascending: false })
        .limit(10);

    if (!data) return [];

    const suggestions: SuggestionItem[] = [];
    const seenMovies = new Set<string>();
    const seenArtists = new Set<string>();
    const seenActors = new Set<string>();

    // 1. Top matching Ringtones (up to 3)
    data.slice(0, 3).forEach((r) => {
        suggestions.push({
            id: `r-${r.id}`,
            type: 'ringtone',
            title: r.title,
            subtitle: `${r.movie_name || 'Ringtone'} • ${r.music_director || r.singers || ''}`.trim(),
            url: `/ringtone/${r.slug}`,
            poster_url: r.poster_url,
            ringtone: r as Ringtone,
        });
    });

    // 2. Matching Movies (up to 2)
    data.forEach((r) => {
        if (r.movie_name && !seenMovies.has(r.movie_name.toLowerCase())) {
            seenMovies.add(r.movie_name.toLowerCase());
            if (suggestions.filter((s) => s.type === 'movie').length < 2) {
                suggestions.push({
                    id: `m-${r.movie_name}`,
                    type: 'movie',
                    title: r.movie_name,
                    subtitle: `Movie ${r.movie_year ? `(${r.movie_year})` : ''}`,
                    url: `/movie/${encodeURIComponent(r.movie_name)}`,
                    poster_url: r.poster_url,
                });
            }
        }
    });

    // 3. Matching Artists (up to 2)
    data.forEach((r) => {
        const md = r.music_director?.trim();
        if (md && md.toLowerCase().includes(lowClean) && !seenArtists.has(md.toLowerCase())) {
            seenArtists.add(md.toLowerCase());
            if (suggestions.filter((s) => s.type === 'artist').length < 2) {
                suggestions.push({
                    id: `a-${md}`,
                    type: 'artist',
                    title: md,
                    subtitle: 'Music Director',
                    url: `/artist/${encodeURIComponent(md)}`,
                });
            }
        }
    });

    // 4. Matching Actors (up to 2)
    data.forEach((r) => {
        if (r.cast_members) {
            r.cast_members.split(/[,&]/).forEach((c: string) => {
                const actor = c.trim();
                if (actor && actor.toLowerCase().includes(lowClean) && !seenActors.has(actor.toLowerCase())) {
                    seenActors.add(actor.toLowerCase());
                    if (suggestions.filter((s) => s.type === 'actor').length < 2) {
                        suggestions.push({
                            id: `act-${actor}`,
                            type: 'actor',
                            title: actor,
                            subtitle: 'Actor',
                            url: `/actor/${encodeURIComponent(actor)}`,
                        });
                    }
                }
            });
        }
    });

    return suggestions;
}
