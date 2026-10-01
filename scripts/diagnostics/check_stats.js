
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://dfcvrisaejumfpjmalui.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmY3ZyaXNhZWp1bWZwam1hbHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODExODcsImV4cCI6MjA4MDM1NzE4N30.kboK9ta5B07Xoiz1CwrQxKssXawkBeS4vVf1VbfLUCo'
);

async function check() {
    const { data, error } = await supabase.rpc('get_all_people_stats');
    if (error) {
        console.error(error);
    } else {
        const actors = data.filter(d => d.is_actor).map(d => d.name);
        console.log('ACTORS_DETECTED:', actors.join(', '));
        const not_actors = data.filter(d => !d.is_actor).slice(0, 20).map(d => d.name);
        console.log('OTHERS:', not_actors.join(', '));
    }
}

check();
