
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkColumns() {
    console.log('Checking profiles columns...');
    const { data, error } = await supabase.from('profiles').select('*').limit(1).single();

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Columns found in profiles:', Object.keys(data));

    console.log('\nChecking withdrawals columns...');
    const { data: wData, error: wError } = await supabase.from('withdrawals').select('*').limit(1);
    if (wError) {
        console.error('Withdrawals Error:', wError);
    } else if (wData && wData.length > 0) {
        console.log('Columns found in withdrawals:', Object.keys(wData[0]));
    } else {
        console.log('Withdrawals table is empty, cannot check columns easily via select *');
    }
}

checkColumns();
