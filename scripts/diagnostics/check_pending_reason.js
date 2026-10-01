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
    const { data: ringtones, error } = await supabase
        .from('ringtones')
        .select('*')
        .ilike('title', '%Senorita%')
        .limit(1);

    if (error) {
        console.error('Error fetching ringtone:', error);
        return;
    }

    if (ringtones.length === 0) {
        console.log('No ringtone found.');
        return;
    }

    const r = ringtones[0];
    console.log('Duplicate Reason (JSON):', JSON.stringify(r.duplicate_reason));
    console.log('Is Suspected Duplicate:', r.is_suspected_duplicate);
    console.log('Acoustic Fingerprint:', r.acoustic_fingerprint);

    if (r.acoustic_fingerprint) {
        // Check for other ringtones with the exact same fingerprint
        const { data: duplicates } = await supabase
            .from('ringtones')
            .select('id, title, movie_name')
            .eq('acoustic_fingerprint', r.acoustic_fingerprint)
            .neq('id', r.id);

        if (duplicates && duplicates.length > 0) {
            console.log('Found duplicates by fingerprint:', duplicates);
        } else {
            console.log('No exact acoustic fingerprint duplicates found.');
        }
    }
}

checkRingtone();
