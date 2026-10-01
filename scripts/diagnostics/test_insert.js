
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testInsert() {
    console.log('Testing insert...');
    // Pick a user id from profiles
    const { data: profile } = await supabase.from('profiles').select('id').limit(1).single();
    if (!profile) return console.error('No profile found');

    const { data, error } = await supabase
        .from('withdrawals')
        .insert({
            user_id: profile.id,
            amount: 100,
            upi_id: 'test@upi',
            status: 'pending'
        })
        .select();

    if (error) {
        console.error('INSERT FAILED:', error);
    } else {
        console.log('INSERT SUCCESS:', data);
        // Clean up
        await supabase.from('withdrawals').delete().eq('id', data[0].id);
    }
}

testInsert();
