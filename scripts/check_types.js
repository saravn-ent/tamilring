
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTypes() {
    console.log('Inspecting data types...');
    const { data: profile } = await supabase.from('profiles').select('is_first_upload_rewarded').limit(1).single();
    if (profile) {
        console.log('is_first_upload_rewarded value:', profile.is_first_upload_rewarded);
        console.log('Type of is_first_upload_rewarded:', typeof profile.is_first_upload_rewarded);
    }
}

checkTypes();
