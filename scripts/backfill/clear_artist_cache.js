/**
 * Cache Invalidation Utility
 * Run this script to manually clear the homepage artists cache
 * Usage: node scripts/clear_artist_cache.js
 */

import { revalidateTag } from 'next/cache';

async function clearArtistCache() {
    try {
        console.log('🔄 Clearing homepage artists cache...');
        
        // Revalidate the homepage-artists tag
        revalidateTag('homepage-artists');
        
        console.log('✅ Cache cleared successfully!');
        console.log('💡 The next page load will fetch fresh artist images from TMDB');
    } catch (error) {
        console.error('❌ Error clearing cache:', error);
        process.exit(1);
    }
}

clearArtistCache();
