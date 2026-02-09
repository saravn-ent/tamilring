
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkFixed() {
    const { data, error } = await supabase
        .from('ringtones')
        .select('id, title, movie_name, poster_url')
        .not('poster_url', 'is', null)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        fs.writeFileSync('fixed_check.txt', 'Error: ' + JSON.stringify(error));
        return;
    }

    let output = 'Recently Updated Ringtones with Artwork:\n';
    data.forEach(r => {
        output += `${r.id} | ${r.title} | ${r.movie_name} | ${r.poster_url}\n`;
    });
    fs.writeFileSync('fixed_check.txt', output);
}

checkFixed();
