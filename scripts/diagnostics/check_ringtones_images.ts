
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use service role for script

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRingtones() {
    const { data: ringtones, error } = await supabase
        .from('ringtones')
        .select('id, title, movie_name, poster_url')
        .limit(20);

    if (error) {
        console.error('Error fetching ringtones:', error);
        return;
    }

    console.log('--- Ringtone Image Check ---');
    ringtones.forEach(r => {
        console.log(`ID: ${r.id}`);
        console.log(`Title: ${r.title}`);
        console.log(`Movie: ${r.movie_name}`);
        console.log(`Poster URL: ${r.poster_url}`);
        console.log('---');
    });
}

checkRingtones();
