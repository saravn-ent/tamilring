const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export interface MovieResult {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
}

export const TMDB_GENRE_TO_TAG: Record<number, string> = {
  28: 'Mass', // Action
  10749: 'Love', // Romance
  35: 'Funny', // Comedy
  53: 'Mass', // Thriller
  80: 'Mass', // Crime
};

export const searchMovies = async (query: string): Promise<MovieResult[]> => {
  if (!query) return [];
  try {
    const res = await fetch(`${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`);
    if (!res.ok) throw new Error('Failed to fetch movies');
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getImageUrl = (path: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500') => {
  if (!path) return '';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export interface MovieCredits {
  crew: {
    job: string;
    name: string;
  }[];
}

export const getMovieCredits = async (movieId: number): Promise<MovieCredits | null> => {
  try {
    const res = await fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=en-US`);
    if (!res.ok) throw new Error('Failed to fetch credits');
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};
export interface PersonResult {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
}

export const searchPerson = async (query: string): Promise<PersonResult | null> => {
  if (!query) return null;
  try {
    const res = await fetch(`${BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`);
    if (!res.ok) throw new Error('Failed to fetch person');
    const data = await res.json();
    return data.results?.[0] || null; // Return the first match
  } catch (error) {
    console.error(`Error searching person ${query}:`, error);
    return null;
  }
};
