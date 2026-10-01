
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function check() {
    const { data } = await supabase
        .from('ringtones')
        .select('title, language, tags, singers, music_director')
        .eq('title', 'Train fight - Master')
        .single();

    console.log('Ringtone details:', data);

    const { count: tamilCount } = await supabase
        .from('ringtones')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .eq('language', 'tamil');

    const { count: nullCount } = await supabase
        .from('ringtones')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .is('language', null);

    console.log('Tamil count:', tamilCount, 'Null language count:', nullCount);
}

check();
