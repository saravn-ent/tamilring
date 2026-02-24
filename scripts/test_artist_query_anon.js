
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dfcvrisaejumfpjmalui.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmY3ZyaXNhZWp1bWZwam1hbHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODExODcsImV4cCI6MjA4MDM1NzE4N30.kboK9ta5B07Xoiz1CwrQxKssXawkBeS4vVf1VbfLUCo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test(artistName) {
    console.log(`\n--- Testing with ANON_KEY for "${artistName}" ---`);
    const multiRoleQuery = [
        `singers.ilike.%${artistName}%`,
        `music_director.ilike.%${artistName}%`,
        `movie_director.ilike.%${artistName}%`,
        `cast_members.ilike.%${artistName}%`,
        `lyricist.ilike.%${artistName}%`
    ].join(',');

    const { data, error } = await supabase
        .from('ringtones')
        .select('title')
        .eq('status', 'approved')
        .or(multiRoleQuery)
        .limit(5);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log(`Results found: ${data.length}`);
    }
}

test('Atlee');
test('Rajinikanth');
