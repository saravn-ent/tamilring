
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkTags() {
    const { data } = await supabase
        .from('ringtones')
        .select('tags')
        .eq('status', 'approved')
        .limit(200);

    const tagCounts: Record<string, number> = {};
    data?.forEach(r => {
        r.tags?.forEach((t: string) => {
            tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
    });

    console.log('Unique tags and counts:', tagCounts);

    const femaleVariants = Object.keys(tagCounts).filter(t => t.toLowerCase() === 'female');
    console.log('Found variants of "female":', femaleVariants);
}

checkTags();
