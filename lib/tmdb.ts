import { MANUAL_ARTIST_IMAGES } from './manual_artists';

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

export type TMDBImageSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original';

/**
 * Get optimized TMDB image URL
 * @param path - TMDB image path
 * @param size - Image size (default: w342 for balance of quality/performance)
 * @returns Full image URL
 */
export const getImageUrl = (
  path: string | null,
  size: TMDBImageSize = 'w342'
): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

/**
 * Get responsive image srcset for TMDB images
 * Provides multiple sizes for browser to choose optimal one
 */
export const getImageSrcSet = (path: string | null): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const sizes: TMDBImageSize[] = ['w185', 'w342', 'w500', 'w780'];
  return sizes
    .map(size => `https://image.tmdb.org/t/p/${size}${path} ${size.slice(1)}w`)
    .join(', ');
};

/**
 * Context-aware image size selection for optimal LCP
 */
export const getOptimalImageSize = (context: 'hero' | 'card' | 'thumbnail' | 'profile'): TMDBImageSize => {
  switch (context) {
    case 'hero':
      return 'w780'; // Large hero images
    case 'card':
      return 'w342'; // Standard cards (optimal balance)
    case 'thumbnail':
      return 'w185'; // Small thumbnails/mobile
    case 'profile':
      return 'w185'; // Artist profile images
    default:
      return 'w342';
  }
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

export interface PersonMovieCredits {
  cast: {
    id: number;
    title: string;
    character: string;
    release_date: string;
    poster_path: string | null;
  }[];
}

export const getPersonMovieCredits = async (personId: number): Promise<PersonMovieCredits | null> => {
  try {
    const res = await fetch(`${BASE_URL}/person/${personId}/movie_credits?api_key=${TMDB_API_KEY}&language=en-US`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) throw new Error('Failed to fetch person credits');
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

import { supabase } from './supabaseClient';

export const searchPerson = async (query: string): Promise<PersonResult | null> => {
  if (!query) return null;

  // 1. Check Database Uploads first (Highest Priority)
  // ... (keep existing db code)
  try {
    const { data: dbImage } = await supabase
      .from('artist_images')
      .select('image_url')
      .eq('artist_name', query)
      .single();

    if (dbImage && dbImage.image_url) {
      return {
        id: 0,
        name: query,
        profile_path: dbImage.image_url,
        known_for_department: 'Manual'
      };
    }
  } catch (e) {
    // Ignore DB errors
  }

  // 2. Check Manual Overrides
  const manualImage = MANUAL_ARTIST_IMAGES[query] ||
    Object.entries(MANUAL_ARTIST_IMAGES).find(([k, v]) => k.toLowerCase() === query.toLowerCase())?.[1];

  if (manualImage) {
    return {
      id: 0,
      name: query,
      profile_path: manualImage,
      known_for_department: 'Manual'
    };
  }

  // 3. TMDB - Fail gracefully if no key
  if (!TMDB_API_KEY) {
    console.error("❌ TMDB_API_KEY is missing in env!");
    return null;
  }

  try {
    const searchUrl = `${BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`;
    // console.log(`🔍 Searching TMDB for: ${query}`); 

    const res = await fetch(searchUrl, {
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`❌ TMDB Error (${res.status}) for "${query}":`, errText);
      throw new Error(`TMDB Error: ${res.status}`);
    }

    const data = await res.json();
    const result = data.results?.[0] || null;

    if (!result) {
      console.warn(`⚠️ No TMDB result found for: "${query}"`);
    } else {
      // console.log(`✅ Found TMDB result for "${query}": ${result.name}`);
    }

    return result;
  } catch (error) {
    console.warn(`Warning: Could not fetch artist "${query}" from TMDB.`, error);
    return null;
  }
};
