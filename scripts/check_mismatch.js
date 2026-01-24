
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://dfcvrisaejumfpjmalui.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmY3ZyaXNhZWp1bWZwam1hbHVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDc4MTE4NywiZXhwIjoyMDgwMzU3MTg3fQ.w6fhHjEHhjKnELN0Im-kdzBWLIMgJV-ZSL9huEwRfiA'
);

async function check() {
    const { data: jn } = await supabase
        .from('ringtones')
        .select('id, title, movie_name, singers')
        .or('movie_name.ilike.%Jana Nayagan%,title.ilike.%Jana Nayagan%');

    if (jn) {
        jn.forEach(r => {
            console.log(`ID: ${r.id} | TITLE: ${r.title} | MOVIE: ${r.movie_name} | SINGERS: ${r.singers}`);
        });
    }

    const { data: vijay } = await supabase
        .from('ringtones')
        .select('id, title, movie_name, singers')
        .or('singers.ilike.%Vijay%,title.ilike.%Vijay%')
        .limit(10);

    if (vijay) {
        console.log('--- VIJAY ENTRIES ---');
        vijay.forEach(r => {
            console.log(`ID: ${r.id} | TITLE: ${r.title} | MOVIE: ${r.movie_name} | SINGERS: ${r.singers}`);
        });
    }
}

check();
