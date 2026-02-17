/**
 * TMDB Artist Image Diagnostic Tool
 * Tests if TMDB API can fetch images for specific artists
 * Usage: node scripts/test_tmdb_artists.js
 */

const TMDB_API_KEY = '565f409b9c46bedc1fc2a9165c7d0666';
const BASE_URL = 'https://api.themoviedb.org/3';

const TMDB_SEARCH_ALIASES = {
  "Vijay": "Joseph Vijay",
  "Vikram": "Chiyaan Vikram",
  "Suriya": "Suriya Sivakumar",
};

const artistsToTest = [
    'Vijay',
    'Ajith Kumar',
    'Rajinikanth',
    'Anirudh Ravichander',
    'A.R. Rahman',
    'Ilayaraja'
];

async function testArtist(artistName) {
    const queryToUse = TMDB_SEARCH_ALIASES[artistName] || artistName;
    
    try {
        const searchUrl = `${BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(queryToUse)}&language=en-US&page=1&include_adult=false`;
        
        console.log(`\n🔍 Searching for: "${artistName}" (query: "${queryToUse}")`);
        
        const res = await fetch(searchUrl);
        
        if (!res.ok) {
            console.error(`   ❌ HTTP Error: ${res.status} ${res.statusText}`);
            return;
        }
        
        const data = await res.json();
        const result = data.results?.[0];
        
        if (!result) {
            console.log(`   ⚠️  No results found`);
            return;
        }
        
        console.log(`   ✅ Found: ${result.name}`);
        console.log(`   📸 Profile Path: ${result.profile_path || 'NONE'}`);
        
        if (result.profile_path) {
            const imageUrl = `https://image.tmdb.org/t/p/w185${result.profile_path}`;
            console.log(`   🖼️  Image URL: ${imageUrl}`);
        } else {
            console.log(`   ⚠️  NO IMAGE AVAILABLE`);
        }
        
        console.log(`   🎭 Department: ${result.known_for_department || 'Unknown'}`);
        
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
    }
}

async function runTests() {
    console.log('🚀 TMDB Artist Image Diagnostic Tool');
    console.log('=====================================\n');
    
    for (const artist of artistsToTest) {
        await testArtist(artist);
    }
    
    console.log('\n\n✅ Diagnostic complete!');
}

runTests();
