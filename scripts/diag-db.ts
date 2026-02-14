
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function check() {
    const { count, error } = await supabase
        .from('ringtones')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

    console.log('Total Approved Ringtones:', count);
    if (error) console.error('Supabase Error:', error);

    const languages = ['tamil', 'english', 'hindi', 'telugu', 'kannada', 'malayalam'];
    for (const lang of languages) {
        const { count: langCount } = await supabase
            .from('ringtones')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'approved')
            .eq('language', lang);
        console.log(`Language ${lang}:`, langCount);
    }
}

check();
