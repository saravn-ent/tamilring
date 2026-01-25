
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    console.log('--- Withdrawal Data Check ---');

    const { data: withdrawals, error } = await supabase
        .from('withdrawals')
        .select('id, user_id, amount, status, upi_id, created_at');

    if (error) {
        console.error('Error fetching withdrawals:', error);
        return;
    }

    console.log(`Total records in 'withdrawals' table: ${withdrawals.length}`);

    if (withdrawals.length > 0) {
        withdrawals.forEach((w, i) => {
            console.log(`[${i + 1}] ID: ${w.id}, User: ${w.user_id}, Amt: ${w.amount}, Status: ${w.status}, UPI: ${w.upi_id}`);
        });
    }

    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name, total_withdrawn_count')
        .gt('total_withdrawn_count', 0);

    console.log('\n--- Profiles with total_withdrawn_count > 0 ---');
    if (profiles) {
        profiles.forEach(p => {
            const countInTable = withdrawals.filter(w => w.user_id === p.id).length;
            console.log(`User: ${p.email} (${p.full_name}) - Count in Profile: ${p.total_withdrawn_count}, Records found: ${countInTable}`);
        });
    }
}

check();
