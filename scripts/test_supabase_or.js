
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://dfcvrisaejumfpjmalui.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmY3ZyaXNhZWp1bWZwam1hbHVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDc4MTE4NywiZXhwIjoyMDgwMzU3MTg3fQ.w6fhHjEHhjKnELN0Im-kdzBWLIMgJV-ZSL9huEwRfiA'
);

async function testQuery(artistName, column) {
    const roleSpecificQuery = `${column}.ilike.%${artistName}%`;
    console.log(`\n--- Testing query for "${artistName}" on ${column} ---`);
    console.log(`Query: ${roleSpecificQuery}`);

    const { data, error } = await supabase
        .from('ringtones')
        .select('id, title, movie_director')
        .eq('status', 'approved')
        .or(roleSpecificQuery)
        .limit(5);

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log(`Found ${data.length} results`);
        data.forEach(r => console.log(` - ${r.title} (Dir: ${r.movie_director})`));
    }
}

async function main() {
    await testQuery('Atlee', 'movie_director');
    await testQuery('Mani Ratnam', 'movie_director');
    await testQuery('Rajinikanth', 'cast_members');
}

main();
