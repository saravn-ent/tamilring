
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRingtones() {
    const { data, error } = await supabase
        .from('ringtones')
        .select('id, title, movie_name, poster_url')
        .ilike('movie_name', '%Vamanan%');

    if (error) {
        fs.writeFileSync('ringtones_output.txt', 'Error: ' + JSON.stringify(error));
        return;
    }

    let output = 'Ringtones for Vamanan:\n';
    data.forEach(r => {
        output += `${r.id} | ${r.title} | ${r.movie_name} | ${r.poster_url}\n`;
    });
    fs.writeFileSync('ringtones_output.txt', output);
}

checkRingtones();
