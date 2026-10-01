/**
 * Comprehensive Poster Fix Script
 * 
 * This script addresses missing album art by:
 * 1. Attempting to fetch from TMDB for movies
 * 2. Attempting to fetch from iTunes for albums/songs
 * 3. Using deity-specific images for devotional content
 * 4. Generating placeholder images with proper categorization
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: '.env.local' });

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Deity to image mapping (fallback for devotional content)
const DEITY_IMAGES = {
    'Murugan': 'https://images.unsplash.com/photo-1604608672516-f1b1f1c0b4e1?w=600',
    'Siva': 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600',
    'Shiva': 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600',
    'Ganesha': 'https://images.unsplash.com/photo-1597262975002-c5c3b14bbd62?w=600',
    'Vinayagar': 'https://images.unsplash.com/photo-1597262975002-c5c3b14bbd62?w=600',
    'Krishna': 'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=600',
    'Vishnu': 'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=600',
    'Lakshmi': 'https://images.unsplash.com/photo-1604608672516-f1b1f1c0b4e1?w=600',
    'Saraswati': 'https://images.unsplash.com/photo-1604608672516-f1b1f1c0b4e1?w=600',
    'Durga': 'https://images.unsplash.com/photo-1604608672516-f1b1f1c0b4e1?w=600',
    'Kali': 'https://images.unsplash.com/photo-1604608672516-f1b1f1c0b4e1?w=600',
    'Hanuman': 'https://images.unsplash.com/photo-1604608672516-f1b1f1c0b4e1?w=600',
    'Rama': 'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=600',
    'Sai': 'https://images.unsplash.com/photo-1604608672516-f1b1f1c0b4e1?w=600',
    'Ayyappan': 'https://images.unsplash.com/photo-1604608672516-f1b1f1c0b4e1?w=600',
    'Perumal': 'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=600'
};

// Generic category placeholders
const CATEGORY_PLACEHOLDERS = {
    'devotional': 'https://images.unsplash.com/photo-1604608672516-f1b1f1c0b4e1?w=600',
    'movie': 'https://images.unsplash.com/photo-1574267432644-f610a5e0d4c5?w=600',
    'album': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600',
    'default': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600'
};

async function searchMovies(query) {
    if (!query) return [];
    try {
        const res = await fetch(`${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.results || [];
    } catch (error) {
        console.error(`TMDB search error for "${query}":`, error.message);
        return [];
    }
}

async function searchITunes(query) {
    if (!query) return [];
    try {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=5`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.results || [];
    } catch (error) {
        console.error(`iTunes search error for "${query}":`, error.message);
        return [];
    }
}

function getDeityImage(movieName) {
    // Check if movie_name contains any deity name
    const lowerMovieName = movieName.toLowerCase();
    for (const [deity, imageUrl] of Object.entries(DEITY_IMAGES)) {
        if (lowerMovieName.includes(deity.toLowerCase())) {
            return imageUrl;
        }
    }
    return null;
}

function getCategoryPlaceholder(ringtone) {
    // Check tags for devotional
    if (ringtone.tags && ringtone.tags.includes('Devotional')) {
        return CATEGORY_PLACEHOLDERS.devotional;
    }
    // Default to movie placeholder
    return CATEGORY_PLACEHOLDERS.movie;
}

async function fixPosterForRingtone(ringtone) {
    const movieName = ringtone.movie_name;
    
    // Skip generic/invalid movie names
    if (!movieName || movieName === 'F1' || movieName === 'Other' || movieName === 'Bomb') {
        console.log(`⏭️  Skipping: ${ringtone.title} (Invalid movie: ${movieName})`);
        const placeholder = getCategoryPlaceholder(ringtone);
        await updatePoster(ringtone.id, placeholder, null, null);
        return { success: true, method: 'placeholder' };
    }

    console.log(`\n🔍 Processing: ${ringtone.title} (Movie: ${movieName})`);

    // 1. Check if it's a devotional song - try deity image
    if (ringtone.tags && ringtone.tags.includes('Devotional')) {
        const deityImage = getDeityImage(movieName);
        if (deityImage) {
            console.log(`  ✅ Found deity image for ${movieName}`);
            await updatePoster(ringtone.id, deityImage, null, null);
            return { success: true, method: 'deity' };
        }
    }

    // 2. Try TMDB for movies
    console.log(`  🎬 Searching TMDB for "${movieName}"...`);
    const tmdbResults = await searchMovies(movieName);
    if (tmdbResults.length > 0) {
        // Check top 3 results for one with a poster
        const bestMatch = tmdbResults.slice(0, 3).find(m => m.poster_path);
        
        if (bestMatch?.poster_path) {
            const posterUrl = `https://image.tmdb.org/t/p/w342${bestMatch.poster_path}`;
            const backdropUrl = bestMatch.backdrop_path ? `https://image.tmdb.org/t/p/w780${bestMatch.backdrop_path}` : null;
            const year = bestMatch.release_date ? bestMatch.release_date.split('-')[0] : null;
            
            console.log(`  ✅ Found TMDB poster: ${bestMatch.title} (${year})`);
            await updatePoster(ringtone.id, posterUrl, backdropUrl, year);
            return { success: true, method: 'tmdb' };
        }
    }

    // 3. Try iTunes for albums/songs
    console.log(`  🎵 Searching iTunes for "${movieName}"...`);
    const itunesResults = await searchITunes(movieName);
    if (itunesResults.length > 0) {
        const best = itunesResults[0];
        if (best.artworkUrl100) {
            const posterUrl = best.artworkUrl100.replace(/\/\d+x\d+bb/, '/600x600bb');
            console.log(`  ✅ Found iTunes artwork: ${best.trackName}`);
            await updatePoster(ringtone.id, posterUrl, null, null);
            return { success: true, method: 'itunes' };
        }
    }

    // 4. Last resort: Use category placeholder
    console.log(`  ⚠️  No match found on TMDB or iTunes, using placeholder`);
    const placeholder = getCategoryPlaceholder(ringtone);
    await updatePoster(ringtone.id, placeholder, null, null);
    return { success: true, method: 'placeholder' };
}

async function updatePoster(ringtoneId, posterUrl, backdropUrl, year) {
    const updateData = { poster_url: posterUrl };
    if (backdropUrl) updateData.backdrop_url = backdropUrl;
    if (year) updateData.movie_year = year;

    const { error } = await supabase
        .from('ringtones')
        .update(updateData)
        .eq('id', ringtoneId);

    if (error) {
        console.error(`  ❌ Failed to update ${ringtoneId}:`, error.message);
        throw error;
    }
}

async function main() {
    console.log('🚀 Starting Comprehensive Poster Fix...\n');

    // Fetch ringtones with missing posters (both approved and pending)
    const { data: ringtones, error } = await supabase
        .from('ringtones')
        .select('id, title, movie_name, tags, status, poster_url')
        .or(`poster_url.is.null,poster_url.in.(${Object.values(CATEGORY_PLACEHOLDERS).map(p => `"${p}"`).join(',')})`)
        .in('status', ['approved', 'pending'])
        .limit(100); // Process in batches

    if (error) {
        console.error('❌ Database error:', error);
        return;
    }

    console.log(`📊 Found ${ringtones.length} ringtones with missing posters\n`);

    const stats = {
        total: ringtones.length,
        tmdb: 0,
        itunes: 0,
        deity: 0,
        placeholder: 0,
        failed: 0
    };

    for (const ringtone of ringtones) {
        try {
            const result = await fixPosterForRingtone(ringtone);
            if (result.success) {
                stats[result.method]++;
            }
            // Rate limiting - wait 250ms between requests
            await new Promise(resolve => setTimeout(resolve, 250));
        } catch (error) {
            console.error(`  ❌ Error processing ${ringtone.id}:`, error.message);
            stats.failed++;
        }
    }

    console.log('\n\n📈 Final Statistics:');
    console.log('═══════════════════════════════════');
    console.log(`Total Processed:    ${stats.total}`);
    console.log(`TMDB Matches:       ${stats.tmdb}`);
    console.log(`iTunes Matches:     ${stats.itunes}`);
    console.log(`Deity Images:       ${stats.deity}`);
    console.log(`Placeholders:       ${stats.placeholder}`);
    console.log(`Failed:             ${stats.failed}`);
    console.log('═══════════════════════════════════\n');

    // Save stats to file
    const statsFile = path.join(__dirname, '..', 'poster_fix_stats.json');
    fs.writeFileSync(statsFile, JSON.stringify({
        timestamp: new Date().toISOString(),
        stats
    }, null, 2));
    console.log(`📝 Stats saved to: ${statsFile}`);
}

main().catch(console.error);
