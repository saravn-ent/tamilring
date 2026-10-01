
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data, error } = await supabase.from('ringtones').select('*').limit(1);
    if (error) {
        fs.writeFileSync('ringtones_columns.json', JSON.stringify({ error: error.message }));
    } else if (data && data.length > 0) {
        fs.writeFileSync('ringtones_columns.json', JSON.stringify(Object.keys(data[0])));
    } else {
        fs.writeFileSync('ringtones_columns.json', JSON.stringify({ error: 'Empty table' }));
    }
}
check();
