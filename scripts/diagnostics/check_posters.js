
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMissingPosters() {
    const { data: ringtones, error } = await supabase
        .from('ringtones')
        .select('id, title, poster_url, movie_name')
        .or('poster_url.is.null,poster_url.eq.""')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Error fetching ringtones:', error);
        return;
    }

    if (ringtones.length === 0) {
        console.log('No ringtones found with missing posters in the database.');
    } else {
        console.log(`Found ${ringtones.length} ringtones with missing posters:`);
        console.log(JSON.stringify(ringtones, null, 2));
    }
}

checkMissingPosters();
