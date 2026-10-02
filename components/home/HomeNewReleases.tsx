import React from 'react';
import SectionHeader from '@/components/SectionHeader';
import NewReleasesList from './NewReleasesList';
import { supabase } from '@/lib/supabaseClient';
import { unstable_cache } from 'next/cache';
import StructuredData from '@/components/StructuredData';
import { generateMovieItemListSchema } from '@/lib/seo';

export interface NewRelease {
    movie_name: string;
    poster_url: string;
    movie_year: string;
    ringtone_count: number;
    music_director?: string | null;
    movie_director?: string | null;
}

const getNewReleases = unstable_cache(
    async (lang: string = 'tamil'): Promise<NewRelease[]> => {
        // Fetch current and recent theatrical releases (2024+) with approved posters
        let query = supabase
            .from('ringtones')
            .select('movie_name, poster_url, movie_year, music_director, movie_director, created_at, likes, downloads')
            .eq('status', 'approved')
            .not('poster_url', 'is', null)
            .neq('poster_url', '');

        if (lang === 'tamil') {
            query = query.or(`language.eq.${lang},language.is.null`);
        } else {
            query = query.eq('language', lang);
        }

        // 1. Prioritize current/recent theatrical wave (2024+)
        const { data: ringtones } = await query
            .gte('movie_year', '2024')
            .order('movie_year', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(200);

        let dataToProcess = ringtones || [];

        // Fallback to recent movies if fewer than 6 titles are found
        if (dataToProcess.length < 6) {
            let fallbackQuery = supabase
                .from('ringtones')
                .select('movie_name, poster_url, movie_year, music_director, movie_director, created_at, likes, downloads')
                .eq('status', 'approved')
                .not('poster_url', 'is', null)
                .neq('poster_url', '');

            if (lang === 'tamil') {
                fallbackQuery = fallbackQuery.or(`language.eq.${lang},language.is.null`);
            } else {
                fallbackQuery = fallbackQuery.eq('language', lang);
            }

            const { data: fallbackData } = await fallbackQuery
                .order('created_at', { ascending: false })
                .limit(100);

            dataToProcess = fallbackData || [];
        }

        if (dataToProcess.length === 0) return [];

        // Group by movie_name → pick the highest quality poster, composer, director, and aggregate engagement
        const movieMap = new Map<string, NewRelease & { score: number }>();

        for (const r of dataToProcess) {
            if (!r.movie_name) continue;
            const likes = r.likes || 0;
            const downloads = r.downloads || 0;

            if (movieMap.has(r.movie_name)) {
                const item = movieMap.get(r.movie_name)!;
                item.ringtone_count++;
                item.score += 15 + likes * 5 + downloads;

                if (!item.music_director && r.music_director) {
                    item.music_director = r.music_director;
                }
                if (!item.movie_director && r.movie_director) {
                    item.movie_director = r.movie_director;
                }
                // Prefer high-res tmdb poster if available
                if (!item.poster_url.includes('tmdb.org') && r.poster_url.includes('tmdb.org')) {
                    item.poster_url = r.poster_url;
                }
            } else {
                movieMap.set(r.movie_name, {
                    movie_name: r.movie_name,
                    poster_url: r.poster_url,
                    movie_year: r.movie_year || '',
                    music_director: r.music_director || null,
                    movie_director: r.movie_director || null,
                    ringtone_count: 1,
                    score: 20 + likes * 5 + downloads,
                });
            }
        }

        // Sort movies: Year descending (2026, 2025, 2024), and within the same year by popularity/score
        const sorted = Array.from(movieMap.values()).sort((a, b) => {
            const yearA = parseInt(a.movie_year, 10) || 0;
            const yearB = parseInt(b.movie_year, 10) || 0;
            if (yearB !== yearA) {
                return yearB - yearA;
            }
            return b.score - a.score;
        });

        // Return top 10 unique theatrical movies
        return sorted.slice(0, 10).map(({ movie_name, poster_url, movie_year, ringtone_count, music_director, movie_director }) => ({
            movie_name,
            poster_url,
            movie_year,
            ringtone_count,
            music_director,
            movie_director,
        }));
    },
    ['new-theatrical-releases-v4'],
    { revalidate: 3600, tags: ['new-releases', 'theaters', 'recent'] }
);

export default async function HomeNewReleases({ lang }: { lang: string }) {
    const releases = await getNewReleases(lang);

    if (!releases || releases.length === 0) return null;

    const movieItemListSchema = generateMovieItemListSchema({
        name: 'Now in Theaters — Fresh Tamil Releases',
        description: 'Latest theatrical Tamil movie releases and official ringtone cuts.',
        items: releases.map(r => ({
            name: r.movie_name,
            year: r.movie_year,
            poster_url: r.poster_url,
            director: r.movie_director || undefined,
            music_director: r.music_director || undefined,
        })),
    });

    return (
        <div className="mb-6">
            <StructuredData data={movieItemListSchema} />
            <div className="px-3 sm:px-4">
                <SectionHeader
                    title="Now in Theaters"
                    subtitle="Fresh Kollywood Releases"
                    href="/recent"
                />
            </div>
            <NewReleasesList releases={releases} />
        </div>
    );
}


