
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://dfcvrisaejumfpjmalui.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmY3ZyaXNhZWp1bWZwam1hbHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODExODcsImV4cCI6MjA4MDM1NzE4N30.kboK9ta5B07Xoiz1CwrQxKssXawkBeS4vVf1VbfLUCo'
);

async function check() {
    const { data, error } = await supabase
        .from('ringtones')
        .select('movie_name')
        .limit(20);

    if (error) {
        console.error(error);
    } else {
        const movies = [...new Set(data.map(d => d.movie_name))];
        console.log('Movies:', movies);
    }
}

check();
