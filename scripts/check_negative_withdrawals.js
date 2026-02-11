
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkNegativeWithdrawals() {
    console.log('Checking for negative completion/pending withdrawals...');

    const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .lt('amount', 0);

    if (error) {
        console.error('Error fetching withdrawals:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('FOUND NEGATIVE WITHDRAWALS:');
        data.forEach(w => {
            console.log(`- ID: ${w.id}, User: ${w.user_id}, Amount: ${w.amount}, Status: ${w.status}`);
        });
    } else {
        console.log('No negative withdrawals found.');
    }
}

checkNegativeWithdrawals();
