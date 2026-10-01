const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
try {
    const envPath = path.resolve(__dirname, '../.env.local');
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} catch (e) {
    console.error('Error loading .env.local', e);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecentRingtones() {
    const { data: ringtones, error } = await supabase
        .from('ringtones')
        .select('id, created_at, title, movie_name, status, poster_url')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Error fetching ringtones:', error);
        return;
    }

    if (ringtones.length === 0) {
        console.log('No ringtones found.');
        return;
    }

    fs.writeFileSync('recent_uploads.json', JSON.stringify(ringtones, null, 2));
    console.log('Saved 20 recent uploads to recent_uploads.json');
}

checkRecentRingtones();
