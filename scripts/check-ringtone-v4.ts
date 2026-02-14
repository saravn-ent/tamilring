
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function check() {
    const { data } = await supabase
        .from('ringtones')
        .select('title, language, tags, singers, music_director, movie_name')
        .eq('status', 'approved')
        .limit(5);

    fs.writeFileSync('ringtone_check.txt', JSON.stringify(data, null, 2));
}

check();
