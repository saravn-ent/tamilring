
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Common aliases for Tamil artists to help TMDB search
const TMDB_SEARCH_ALIASES = {
  "Vijay": "Joseph Vijay",
  "Vikram": "Chiyaan Vikram",
  "Suriya": "Suriya Sivakumar",
  "Ilaiyaraaja": "Ilaiyaraaja",
  "Ilayaraja": "Ilaiyaraaja",
  "A.R. Rahman": "A. R. Rahman",
  "AR Rahman": "A. R. Rahman",
};

async function searchPerson(query) {
    if (!query) return null;
    const queryToUse = TMDB_SEARCH_ALIASES[query] ?? query;
    try {
        const searchUrl = `${BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(queryToUse)}&language=en-US&page=1&include_adult=false`;
        const res = await fetch(searchUrl);
        if (!res.ok) return null;
        const data = await res.json();
        return data.results?.[0] || null;
    } catch (error) {
        return null;
    }
}

async function syncArtists() {
    console.log('🔄 Starting Artist Profile Sync...');

    // 1. Get all unique artists from ringtones
    const { data: ringtones, error } = await supabase
        .from('ringtones')
        .select('singers, music_director, movie_director, cast_members');

    if (error) {
        console.error('❌ Error fetching ringtones:', error);
        return;
    }

    const artistNames = new Set();
    ringtones.forEach(r => {
        const parseList = (str) => {
            if (!str) return [];
            return str.split(/[,&]|\band\b/i).map(s => s.trim()).filter(Boolean);
        };

        parseList(r.singers).forEach(name => artistNames.add(name));
        parseList(r.music_director).forEach(name => artistNames.add(name));
        parseList(r.movie_director).forEach(name => artistNames.add(name));
        parseList(r.cast_members).forEach(name => artistNames.add(name));
    });

    console.log(`📊 Total unique artists to check: ${artistNames.size}`);

    // 2. Filter out those who already have images
    const { data: existingImages } = await supabase.from('artist_images').select('artist_name');
    const existingNames = new Set(existingImages.map(img => img.artist_name));
    
    const artistsToSync = Array.from(artistNames).filter(name => !existingNames.has(name));
    console.log(`➡️  Artists to sync: ${artistsToSync.length}`);

    let count = 0;
    let success = 0;

    // 3. Sync in batches to avoid rate limits
    for (const name of artistsToSync) {
        count++;
        process.stdout.write(`[${count}/${artistsToSync.length}] Searching for ${name}... `);

        const person = await searchPerson(name);
        if (person && person.profile_path) {
            const imageUrl = `https://image.tmdb.org/t/p/w185${person.profile_path}`;
            
            const { error: insertError } = await supabase
                .from('artist_images')
                .upsert({
                    artist_name: name,
                    image_url: imageUrl
                }, { onConflict: 'artist_name' });

            if (insertError) {
                console.log('❌ Error saving to DB');
            } else {
                console.log('✅ Saved!');
                success++;
            }
        } else {
            console.log('⚠️  No image found on TMDB');
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
        
    }

    console.log(`\n\n✅ Sync complete!`);
    console.log(`Found and saved images for ${success} new artists.`);
}

syncArtists();
