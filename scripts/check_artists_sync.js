
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkArtists() {
    // 1. Get all unique artists from ringtones
    const { data: ringtones, error } = await supabase
        .from('ringtones')
        .select('singers, music_director, movie_director, cast_members');

    if (error) {
        console.error('Error fetching ringtones:', error);
        return;
    }

    const artistNames = new Set();
    ringtones.forEach(r => {
        const parseList = (str) => {
            if (!str) return [];
            return str.split(/[,&]|\band\b/i).map(s => s.trim()).filter(Boolean);
        };

        parseList(r.singers).forEach(name => artistNames.add(name));
        parseList(r.music_director).forEach(name => artistNames.add(name));
        parseList(r.movie_director).forEach(name => artistNames.add(name));
        parseList(r.cast_members).forEach(name => artistNames.add(name));
    });

    console.log(`Unique artists found in ringtones: ${artistNames.size}`);

    // 2. Check how many have images in artist_images
    const { data: existingImages, error: imgError } = await supabase
        .from('artist_images')
        .select('artist_name');

    if (imgError) {
        console.error('Error fetching artist_images:', imgError);
        return;
    }

    const existingNames = new Set(existingImages.map(img => img.artist_name));
    
    let missingCount = 0;
    const missingSample = [];
    artistNames.forEach(name => {
        if (!existingNames.has(name)) {
            missingCount++;
            if (missingSample.length < 20) missingSample.push(name);
        }
    });

    console.log(`Artists with custom images: ${existingNames.size}`);
    console.log(`Artists missing custom images: ${missingCount}`);
    
    if (missingSample.length > 0) {
        console.log('\nSample Artists missing images (will rely on TMDB lookup):');
        missingSample.forEach(name => console.log(`- ${name}`));
    }
}

checkArtists();
