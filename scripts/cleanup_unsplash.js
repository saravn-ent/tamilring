
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupUnsplash() {
    console.log('🧹 Cleaning up failing Unsplash URLs...');
    
    const { data: ringtones, error } = await supabase
        .from('ringtones')
        .select('id, poster_url')
        .filter('poster_url', 'ilike', '%unsplash.com%');

    if (error) {
        console.error('Error fetching ringtones:', error);
        return;
    }

    console.log(`📊 Found ${ringtones.length} ringtones with Unsplash URLs.`);

    for (const ringtone of ringtones) {
        console.log(`Resetting poster for ${ringtone.id}...`);
        await supabase
            .from('ringtones')
            .update({ poster_url: null })
            .eq('id', ringtone.id);
    }

    console.log('✅ Cleanup complete. Run the sync-posters API to regenerate them with stable placeholders.');
}

cleanupUnsplash();
