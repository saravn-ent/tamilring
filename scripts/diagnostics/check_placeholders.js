
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CATEGORY_PLACEHOLDERS = [
    'https://images.unsplash.com/photo-1604608672516-f1b1f1c0b4e1?w=600',
    'https://images.unsplash.com/photo-1574267432644-f610a5e0d4c5?w=600',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600',
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600'
];

async function checkPlaceholders() {
    const { data: allRingtones, error } = await supabase
        .from('ringtones')
        .select('id, poster_url, status');

    if (error) {
        console.error('Error fetching ringtones:', error);
        return;
    }

    const total = allRingtones.length;
    const nullPosters = allRingtones.filter(r => !r.poster_url).length;
    const placeholderPosters = allRingtones.filter(r => CATEGORY_PLACEHOLDERS.includes(r.poster_url)).length;
    const realPosters = total - nullPosters - placeholderPosters;

    console.log(`Summary of Ringtones:`);
    console.log(`Total: ${total}`);
    console.log(`NULL Posters: ${nullPosters}`);
    console.log(`Placeholder Posters: ${placeholderPosters}`);
    console.log(`Real Posters: ${realPosters}`);
    
    // List some placeholders to see which ones are common
    const samplePlaceholders = allRingtones
        .filter(r => CATEGORY_PLACEHOLDERS.includes(r.poster_url))
        .slice(0, 10);
    
    if (samplePlaceholders.length > 0) {
        console.log('\nSample Ringtones with Placeholders:');
        samplePlaceholders.forEach(r => console.log(`- ${r.id} (Status: ${r.status})`));
    }
}

checkPlaceholders();
