
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://dfcvrisaejumfpjmalui.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmY3ZyaXNhZWp1bWZwam1hbHVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDc4MTE4NywiZXhwIjoyMDgwMzU3MTg3fQ.w6fhHjEHhjKnELN0Im-kdzBWLIMgJV-ZSL9huEwRfiA'
);

const TMDB_API_KEY = '565f409b9c46bedc1fc2a9165c7d0666';

async function sync() {
    console.log('--- Resyncing Cast with Precision Filters ---');

    // 1. Clear all existing cast_members to remove "Hollywood" junk
    await supabase.from('ringtones').update({ cast_members: null }).neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('Cleared existing cast data.');

    // 2. Fetch movies with their years
    const { data: movies } = await supabase.from('ringtones').select('movie_name, movie_year').order('movie_name');

    const movieMap = new Map();
    movies.forEach(m => {
        if (m.movie_name && !movieMap.has(m.movie_name)) {
            movieMap.set(m.movie_name, m.movie_year);
        }
    });

    console.log(`Processing ${movieMap.size} movies specifically...`);

    for (const [movieName, movieYear] of movieMap) {
        try {
            console.log(`Syncing: ${movieName} (${movieYear || 'No Year'})`);

            // Precision Search: Add year and language
            let url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieName)}&language=ta-IN&include_adult=false`;
            if (movieYear) url += `&primary_release_year=${movieYear}`;

            const searchRes = await fetch(url);
            const searchData = await searchRes.json();

            // If no Tamil result, try without language but keep year
            let movie = searchData.results?.[0];
            if (!movie && movieYear) {
                const fallbackRes = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieName)}&primary_release_year=${movieYear}`);
                const fallbackData = await fallbackRes.json();
                movie = fallbackData.results?.[0];
            }

            if (movie) {
                const creditsRes = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${TMDB_API_KEY}`);
                const creditsData = await creditsRes.json();

                // ONLY TOP 3 actors - avoids minor cast appearing on home page
                const topCast = creditsData.cast
                    ?.slice(0, 3)
                    .map(c => c.name)
                    .join(', ');

                if (topCast) {
                    console.log(`   ✅ Matched: ${movie.title} | Cast: ${topCast}`);
                    await supabase
                        .from('ringtones')
                        .update({ cast_members: topCast })
                        .eq('movie_name', movieName);
                }
            } else {
                console.log(`   ❌ Not found on TMDB`);
            }

            await new Promise(r => setTimeout(r, 200));
        } catch (e) {
            console.error(`   Error:`, e.message);
        }
    }
}

sync();
