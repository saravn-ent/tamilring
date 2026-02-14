
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testSections() {
    console.log('--- Testing Home Sections Data ---');

    // Test 1: HomeFemaleSingers logic
    const { data: femaleRingtones, error: fError } = await supabase
        .from('ringtones')
        .select('singers, tags')
        .eq('status', 'approved')
        .contains('tags', ['Female']);

    if (fError) console.error('Female Singers Query Error:', fError);
    console.log('Female tagged ringtones count:', femaleRingtones?.length || 0);

    // Test 2: General Artists logic
    const { data: allRingtones, error: aError } = await supabase
        .from('ringtones')
        .select('music_director, singers, tags')
        .eq('status', 'approved')
        .limit(10);

    if (aError) console.error('All Ringtones Query Error:', aError);
    console.log('Sample ringtones count:', allRingtones?.length || 0);

    // Test 3: TMDB check
    const artist = 'S. Janaki';
    const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    console.log('TMDB API KEY exists:', !!TMDB_API_KEY);

    try {
        const res = await fetch(`https://api.themoviedb.org/3/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(artist)}&language=en-US&page=1&include_adult=false`);
        const data = await res.json();
        console.log('TMDB Search result for S. Janaki:', data.results?.[0]?.name, 'Gender:', data.results?.[0]?.gender);
    } catch (e) {
        console.error('TMDB Fetch Error:', e);
    }
}

testSections();
