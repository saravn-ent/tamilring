
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://dfcvrisaejumfpjmalui.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmY3ZyaXNhZWp1bWZwam1hbHVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDc4MTE4NywiZXhwIjoyMDgwMzU3MTg3fQ.w6fhHjEHhjKnELN0Im-kdzBWLIMgJV-ZSL9huEwRfiA'
);

async function checkArtist(artistName) {
    console.log(`\n--- Checking results for "${artistName}" ---`);

    const { data, error } = await supabase
        .from('ringtones')
        .select('id, title, movie_name, singers, music_director, cast_members, movie_director')
        .or(`singers.ilike.%${artistName}%,music_director.ilike.%${artistName}%,movie_director.ilike.%${artistName}%,cast_members.ilike.%${artistName}%`);

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Found ${data.length} potential matches in DB`);

    const searchLow = artistName.toLowerCase().trim();
    const matched = data.filter(r => {
        const checkMatch = (str) => {
            if (!str) return false;
            const parts = str.split(/[,&]|\band\b/i).map(s => s.trim().toLowerCase());
            return parts.some(s => s === searchLow || s.includes(searchLow));
        };
        return checkMatch(r.singers) || checkMatch(r.music_director) || checkMatch(r.cast_members) || checkMatch(r.movie_director);
    });

    console.log(`Matched ${matched.length} after filtering`);
    matched.slice(0, 5).forEach(r => {
        console.log(`ID: ${r.id} | MOVIE: ${r.movie_name} | SINGERS: ${r.singers} | MD: ${r.music_director} | DIR: ${r.movie_director} | CAST: ${r.cast_members}`);
    });
}

async function main() {
    await checkArtist('Atlee');
    await checkArtist('Rajinikanth');
    await checkArtist('Mani Ratnam');
}

main();
