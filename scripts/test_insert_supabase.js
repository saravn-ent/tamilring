
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testInsert() {
    console.log('Inserting test withdrawal...');

    // Get a random user ID
    const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
    if (!profiles || profiles.length === 0) {
        console.error('No profiles found');
        return;
    }
    const userId = profiles[0].id;

    const { data, error } = await supabase
        .from('withdrawals')
        .insert({
            user_id: userId,
            amount: 999,
            upi_id: 'test@upi',
            status: 'pending'
        })
        .select();

    if (error) {
        console.error('Insert Error:', error);
    } else {
        console.log('Insert Success:', data);
    }
}

testInsert();
