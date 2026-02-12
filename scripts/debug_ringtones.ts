
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: ringtones } = await supabase
        .from('ringtones')
        .select('id, title, movie_name, poster_url, language, tags, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

    console.log(JSON.stringify(ringtones, null, 2));
}

check();
