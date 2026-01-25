
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectTable() {
    console.log('Inspecting withdrawals table...');

    // We can't directly inspect schema via Supabase JS easily, 
    // but we can try to insert a dummy record with all fields to see if it works.

    const { data: profile } = await supabase.from('profiles').select('id').limit(1).single();
    if (!profile) return console.error('No profile');

    const testData = {
        user_id: profile.id,
        amount: 100,
        upi_id: 'test@upi',
        status: 'pending'
    };

    console.log('Attempting insert with:', testData);
    const { data, error } = await supabase.from('withdrawals').insert(testData).select();

    if (error) {
        console.error('Insert error:', error);
    } else {
        console.log('Insert success:', data);
        // Clean up
        await supabase.from('withdrawals').delete().eq('id', data[0].id);
    }
}

inspectTable();
