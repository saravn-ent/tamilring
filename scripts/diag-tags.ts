
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function check() {
    const { data: tagsData } = await supabase
        .from('ringtones')
        .select('tags')
        .eq('status', 'approved')
        .limit(100);

    const allTags = new Set();
    tagsData?.forEach(r => {
        r.tags?.forEach(t => allTags.add(t));
    });

    console.log('All unique tags (sample 100):', Array.from(allTags));
}

check();
