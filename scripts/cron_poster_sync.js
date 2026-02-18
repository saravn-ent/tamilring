/**
 * Automated Poster Sync Cron Job
 * 
 * This script should be run periodically (e.g., daily via cron) to:
 * 1. Find any newly approved ringtones with missing posters
 * 2. Attempt to fetch posters from TMDB/iTunes
 * 3. Apply deity images or placeholders as needed
 * 
 * Usage:
 *   node scripts/cron_poster_sync.js
 * 
 * Recommended Cron Schedule:
 *   0 2 * * * cd /path/to/tamilring && node scripts/cron_poster_sync.js
 *   (Runs daily at 2 AM)
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Deity to image mapping
const DEITY_IMAGES = {
    'Murugan': 'https://ui-avatars.com/api/?name=Murugan&background=ffcc00&color=fff&size=512',
    'Siva': 'https://ui-avatars.com/api/?name=Siva&background=333&color=fff&size=512',
    'Shiva': 'https://ui-avatars.com/api/?name=Shiva&background=333&color=fff&size=512',
    'Ganesha': 'https://ui-avatars.com/api/?name=Ganesha&background=ff9900&color=fff&size=512',
    'Vinayagar': 'https://ui-avatars.com/api/?name=Vinayagar&background=ff9900&color=fff&size=512',
    'Krishna': 'https://ui-avatars.com/api/?name=Krishna&background=3399ff&color=fff&size=512',
    'Vishnu': 'https://ui-avatars.com/api/?name=Vishnu&background=3399ff&color=fff&size=512',
    'Lakshmi': 'https://ui-avatars.com/api/?name=Lakshmi&background=ff66cc&color=fff&size=512',
    'Saraswati': 'https://ui-avatars.com/api/?name=Saraswati&background=ffffff&color=000&size=512',
    'Durga': 'https://ui-avatars.com/api/?name=Durga&background=ff3300&color=fff&size=512',
    'Kali': 'https://ui-avatars.com/api/?name=Kali&background=000&color=fff&size=512',
    'Hanuman': 'https://ui-avatars.com/api/?name=Hanuman&background=ff6600&color=fff&size=512',
    'Rama': 'https://ui-avatars.com/api/?name=Rama&background=33cc33&color=fff&size=512',
    'Sai': 'https://ui-avatars.com/api/?name=Sai&background=e0e0e0&color=000&size=512',
    'Ayyappan': 'https://ui-avatars.com/api/?name=Ayyappan&background=333&color=fff&size=512',
    'Perumal': 'https://ui-avatars.com/api/?name=Perumal&background=3399ff&color=fff&size=512'
};

const CATEGORY_PLACEHOLDERS = {
    'devotional': 'https://ui-avatars.com/api/?name=Devotional&background=ffcc00&color=fff&size=512',
    'movie': 'https://ui-avatars.com/api/?name=Movie&background=333&color=fff&size=512',
    'album': 'https://ui-avatars.com/api/?name=Album&background=666&color=fff&size=512',
    'default': 'https://ui-avatars.com/api/?name=TR&background=f43f5e&color=fff&size=512'
};

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

async function searchITunes(query) {
    if (!query) return [];
    try {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=5`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.results || [];
    } catch (error) {
        return [];
    }
}

function getDeityImage(movieName) {
    const lowerMovieName = movieName.toLowerCase();
    for (const [deity, imageUrl] of Object.entries(DEITY_IMAGES)) {
        if (lowerMovieName.includes(deity.toLowerCase())) {
            return imageUrl;
        }
    }
    return null;
}

function getCategoryPlaceholder(ringtone) {
    if (ringtone.tags && ringtone.tags.includes('Devotional')) {
        return CATEGORY_PLACEHOLDERS.devotional;
    }
    return CATEGORY_PLACEHOLDERS.movie;
}

async function fixPosterForRingtone(ringtone) {
    const movieName = ringtone.movie_name;
    
    if (!movieName || movieName === 'F1' || movieName === 'Other' || movieName === 'Bomb') {
        const placeholder = getCategoryPlaceholder(ringtone);
        await updatePoster(ringtone.id, placeholder, null, null);
        return { success: true, method: 'placeholder' };
    }

    if (ringtone.tags && ringtone.tags.includes('Devotional')) {
        const deityImage = getDeityImage(movieName);
        if (deityImage) {
            await updatePoster(ringtone.id, deityImage, null, null);
            return { success: true, method: 'deity' };
        }
    }

    const tmdbResults = await searchMovies(movieName);
    if (tmdbResults.length > 0) {
        // Check top 3 results for one with a poster
        const bestMatch = tmdbResults.slice(0, 3).find(m => m.poster_path);
        
        if (bestMatch?.poster_path) {
            const posterUrl = `https://image.tmdb.org/t/p/w342${bestMatch.poster_path}`;
            const backdropUrl = bestMatch.backdrop_path ? `https://image.tmdb.org/t/p/w780${bestMatch.backdrop_path}` : null;
            const year = bestMatch.release_date ? bestMatch.release_date.split('-')[0] : null;
            
            await updatePoster(ringtone.id, posterUrl, backdropUrl, year);
            return { success: true, method: 'tmdb' };
        }
    }

    const itunesResults = await searchITunes(movieName);
    if (itunesResults.length > 0) {
        const best = itunesResults[0];
        if (best.artworkUrl100) {
            const posterUrl = best.artworkUrl100.replace(/\/\d+x\d+bb/, '/600x600bb');
            await updatePoster(ringtone.id, posterUrl, null, null);
            return { success: true, method: 'itunes' };
        }
    }

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
        throw error;
    }
}

async function main() {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔄 Starting automated poster sync...`);

    const { data: ringtones, error } = await supabase
        .from('ringtones')
        .select('id, title, movie_name, tags, poster_url')
        .or(`poster_url.is.null,poster_url.in.(${Object.values(CATEGORY_PLACEHOLDERS).map(p => `"${p}"`).join(',')})`)
        .eq('status', 'approved')
        .limit(50);

    if (error) {
        console.error(`[${timestamp}] ❌ Database error:`, error);
        process.exit(1);
    }

    if (ringtones.length === 0) {
        console.log(`[${timestamp}] ✅ No missing posters found. All good!`);
        process.exit(0);
    }

    console.log(`[${timestamp}] 📊 Found ${ringtones.length} ringtones with missing posters`);

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
            await new Promise(resolve => setTimeout(resolve, 250));
        } catch (error) {
            console.error(`[${timestamp}] ❌ Error processing ${ringtone.id}:`, error.message);
            stats.failed++;
        }
    }

    const endTimestamp = new Date().toISOString();
    console.log(`[${endTimestamp}] ✅ Sync complete!`);
    console.log(`  TMDB: ${stats.tmdb}, iTunes: ${stats.itunes}, Deity: ${stats.deity}, Placeholder: ${stats.placeholder}, Failed: ${stats.failed}`);
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
