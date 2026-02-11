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

async function checkAnimals() {
    const { data: ringtones, error } = await supabase
        .from('ringtones')
        .select('*')
        .ilike('title', '%Animals%')
        .limit(5);

    if (error) {
        console.error('Error fetching ringtone:', error);
        return;
    }

    console.log('Found "Animals" ringtones:', ringtones.length);
    ringtones.forEach(r => {
        console.log('--- Ringtone ---');
        console.log('Title:', r.title);
        console.log('ID:', r.id);
        console.log('Acoustic Fingerprint:', r.acoustic_fingerprint ? r.acoustic_fingerprint.substring(0, 50) + '...' : 'Missing');
    });
}

checkAnimals();
