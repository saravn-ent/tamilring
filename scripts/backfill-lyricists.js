/**
 * Backfill Lyricist Data for Existing Ringtones
 * 
 * This script:
 * 1. Fetches all ringtones without lyricist data
 * 2. Looks up TMDB credits for each movie
 * 3. Extracts lyricist names
 * 4. Updates the database
 * 
 * Run with: node scripts/backfill-lyricists.js
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env.local') });

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for admin access

if (!TMDB_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing required environment variables!');
    console.error('Make sure .env.local contains:');
    console.error('  - NEXT_PUBLIC_TMDB_API_KEY');
    console.error('  - NEXT_PUBLIC_SUPABASE_URL');
    console.error('  - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function getMovieIdByName(movieName) {
    try {
        const res = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieName)}`
        );
        const data = await res.json();
        return data.results?.[0]?.id || null;
    } catch (e) {
        console.error(`Failed to find movie: ${movieName}`, e);
        return null;
    }
}

async function getMovieCredits(movieId) {
    try {
        const res = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`
        );
        const data = await res.json();
        return data;
    } catch (e) {
        console.error(`Failed to fetch credits for movie ID: ${movieId}`, e);
        return null;
    }
}

async function backfillLyricists() {
    console.log('🚀 Starting lyricist backfill...\n');

    // Fetch all ringtones without lyricist data
    const { data: ringtones, error } = await supabase
        .from('ringtones')
        .select('id, movie_name, lyricist')
        .is('lyricist', null)
        .not('movie_name', 'is', null);

    if (error) {
        console.error('❌ Error fetching ringtones:', error);
        return;
    }

    console.log(`📊 Found ${ringtones.length} ringtones to process\n`);

    // Group by movie to avoid duplicate API calls
    const movieGroups = {};
    ringtones.forEach(r => {
        if (!movieGroups[r.movie_name]) {
            movieGroups[r.movie_name] = [];
        }
        movieGroups[r.movie_name].push(r.id);
    });

    const uniqueMovies = Object.keys(movieGroups);
    console.log(`🎬 Processing ${uniqueMovies.length} unique movies\n`);

    let updated = 0;
    let skipped = 0;

    for (const movieName of uniqueMovies) {
        console.log(`Processing: ${movieName}...`);

        // Get TMDB movie ID
        const movieId = await getMovieIdByName(movieName);
        if (!movieId) {
            console.log(`  ⚠️  Movie not found in TMDB, skipping`);
            skipped += movieGroups[movieName].length;
            continue;
        }

        // Get credits
        const credits = await getMovieCredits(movieId);
        if (!credits?.crew) {
            console.log(`  ⚠️  No credits found, skipping`);
            skipped += movieGroups[movieName].length;
            continue;
        }

        // Extract lyricists
        const lyricists = credits.crew
            .filter(c => c.job === 'Lyricist' || c.job === 'Writer' || c.department === 'Writing')
            .map(c => c.name)
            .join(', ');

        if (!lyricists) {
            console.log(`  ℹ️  No lyricist found`);
            skipped += movieGroups[movieName].length;
            continue;
        }

        // Update all ringtones for this movie
        const ringtoneIds = movieGroups[movieName];
        const { error: updateError } = await supabase
            .from('ringtones')
            .update({ lyricist: lyricists })
            .in('id', ringtoneIds);

        if (updateError) {
            console.log(`  ❌ Update failed:`, updateError.message);
            skipped += ringtoneIds.length;
        } else {
            console.log(`  ✅ Updated ${ringtoneIds.length} ringtones with: ${lyricists}`);
            updated += ringtoneIds.length;
        }

        // Rate limit: wait 250ms between requests
        await new Promise(resolve => setTimeout(resolve, 250));
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Backfill complete!`);
    console.log(`   Updated: ${updated} ringtones`);
    console.log(`   Skipped: ${skipped} ringtones`);
    console.log('='.repeat(50));
}

backfillLyricists().catch(console.error);
