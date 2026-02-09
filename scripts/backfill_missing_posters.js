
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
// fetch is built-in in Node 18+
dotenv.config({ path: '.env.local' });

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function searchMovies(query) {
    if (!query) return [];
    try {
        const res = await fetch(`${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.results || [];
    } catch (error) {
        return [];
    }
}

async function backfill() {
    const { data: ringtones, error } = await supabase
        .from('ringtones')
        .select('id, movie_name, title')
        .is('poster_url', null)
        .eq('status', 'approved')
        .limit(20);

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Found ${ringtones.length} ringtones to fix.`);

    for (const r of ringtones) {
        const movieName = r.movie_name;
        if (!movieName || movieName === 'F1' || movieName === 'Other' || movieName === 'Murugan' || movieName === 'Siva') {
            console.log(`Skipping: ${r.title} (Movie: ${movieName})`);
            continue;
        }

        console.log(`Searching for "${movieName}"...`);
        const results = await searchMovies(movieName);
        if (results.length > 0) {
            const best = results[0];
            if (best.poster_path) {
                const posterUrl = `https://image.tmdb.org/t/p/w342${best.poster_path}`;
                const backdropUrl = best.backdrop_path ? `https://image.tmdb.org/t/p/w780${best.backdrop_path}` : null;
                const year = best.release_date ? best.release_date.split('-')[0] : null;

                const { error: updateError } = await supabase
                    .from('ringtones')
                    .update({
                        poster_url: posterUrl,
                        backdrop_url: backdropUrl,
                        movie_year: year || undefined
                    })
                    .eq('id', r.id);

                if (updateError) {
                    console.error(`Failed to update ${r.id}:`, updateError);
                } else {
                    console.log(`✅ Fixed: ${r.title} -> ${movieName} (${year})`);
                }
            } else {
                console.log(`❌ No poster for: ${movieName}`);
            }
        } else {
            console.log(`❌ No match for: ${movieName}`);
        }
    }
}

backfill();
