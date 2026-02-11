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

async function checkRingtone() {
    // First get the pending ringtone
    const { data: ringtones, error } = await supabase
        .from('ringtones')
        .select('*')
        .ilike('title', '%Senorita%');

    if (error) {
        console.error('Error fetching ringtone:', error);
        return;
    }

    if (ringtones.length === 0) {
        console.log('No ringtone found.');
        return;
    }

    const r = ringtones[0];
    console.log('--- Ringtone Details ---');
    console.log('ID:', r.id);
    console.log('Title:', r.title);
    console.log('Status:', r.status);
    console.log('Is Suspected Duplicate:', r.is_suspected_duplicate);
    console.log('Duplicate Reason:', r.duplicate_reason);
    console.log('Audio Hash:', r.audio_hash);
    console.log('Acoustic Fingerprint:', r.acoustic_fingerprint ? r.acoustic_fingerprint.substring(0, 50) + '...' : 'Missing');

    // Check for duplicates using the same logic (or manual query)
    if (r.audio_hash) {
        console.log('\n--- Checking for hash duplicates ---');
        const { data: duplicates } = await supabase
            .from('ringtones')
            .select('id, title, status')
            .eq('audio_hash', r.audio_hash)
            .neq('id', r.id);

        if (duplicates && duplicates.length > 0) {
            console.log('Found duplicates by hash:', duplicates);
        } else {
            console.log('No duplicates found by hash.');
        }
    }
}

checkRingtone();
