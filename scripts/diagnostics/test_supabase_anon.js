
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://dfcvrisaejumfpjmalui.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmY3ZyaXNhZWp1bWZwam1hbHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODExODcsImV4cCI6MjA4MDM1NzE4N30.kboK9ta5B07Xoiz1CwrQxKssXawkBeS4vVf1VbfLUCo'
);

async function testQuery(artistName, column) {
    const roleSpecificQuery = `${column}.ilike.%${artistName}%`;
    console.log(`\n--- Testing query with ANON KEY for "${artistName}" on ${column} ---`);

    const { data, error } = await supabase
        .from('ringtones')
        .select('id, title, status')
        .eq('status', 'approved')
        .or(roleSpecificQuery)
        .limit(5);

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log(`Found ${data.length} results`);
        data.forEach(r => console.log(` - ${r.title} (Status: ${r.status})`));
    }
}

async function main() {
    await testQuery('Atlee', 'movie_director');
    await testQuery('Rajinikanth', 'cast_members');
}

main();
