
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://dfcvrisaejumfpjmalui.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmY3ZyaXNhZWp1bWZwam1hbHVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDc4MTE4NywiZXhwIjoyMDgwMzU3MTg3fQ.w6fhHjEHhjKnELN0Im-kdzBWLIMgJV-ZSL9huEwRfiA'
);

async function test(artistName) {
    console.log(`\n--- Testing for "${artistName}" ---`);
    const multiRoleQuery = [
        `singers.ilike.%${artistName}%`,
        `music_director.ilike.%${artistName}%`,
        `movie_director.ilike.%${artistName}%`,
        `cast_members.ilike.%${artistName}%`,
        `lyricist.ilike.%${artistName}%`
    ].join(',');

    const { data, error } = await supabase
        .from('ringtones')
        .select('title, singers, music_director, movie_director, cast_members, lyricist')
        .eq('status', 'approved')
        .or(multiRoleQuery)
        .limit(10);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log(`Results found: ${data.length}`);
        const searchLow = artistName.toLowerCase().trim();
        const matched = data.filter(r => {
            const checkMatch = (str) => {
                if (!str) return false;
                const lowerStr = str.toLowerCase();
                const parts = lowerStr.split(/[,&]|\band\b/i).map(s => s.trim());
                const match = parts.some(p => p === searchLow || p.includes(searchLow));
                if (match) console.log(`  MATCH in: "${str}"`);
                return match;
            };
            return checkMatch(r.singers) || 
                   checkMatch(r.music_director) || 
                   checkMatch(r.movie_director) || 
                   checkMatch(r.cast_members) || 
                   checkMatch(r.lyricist);
        });
        console.log(`Final matched: ${matched.length}`);
    }
}

async function main() {
    await test('Atlee');
    await test('Rajinikanth');
}
main();
