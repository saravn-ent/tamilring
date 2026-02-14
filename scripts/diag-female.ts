
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
        .eq('status', 'approved')
        .contains('tags', ['Female']);

    console.log('Ringtones with Female tag:', count);

    const { data } = await supabase
        .from('ringtones')
        .select('singers')
        .eq('status', 'approved')
        .contains('tags', ['Female'])
        .limit(10);

    console.log('Sample singers from Female tagged songs:', data);
}

check();
